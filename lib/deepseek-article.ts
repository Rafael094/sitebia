// ============================================================================
// Geração AUTOMÁTICA de artigos completos com IA (DeepSeek).
// ----------------------------------------------------------------------------
// Fluxo: o painel pede um novo conteúdo; a IA:
//   1) escolhe/afunila um TEMA recente (PI, inovação, patentes, transferência
//      de tecnologia);
//   2) redige o artigo estruturado (H2/H3, intro, desenvolvimento, conclusão);
//   3) aplica SEO interno e devolve meta título/descrição/keywords prontos;
//   4) propõe um "image_prompt" (em pt-BR) para a capa.
//
// TODO o conteúdo gerado é estritamente em Português do Brasil (pt-BR), com tom
// profissional/técnico — a garantia/saneamento de idioma fica em lib/ptbr.ts.
//
// Sem chave / falha de rede / JSON inválido ⇒ cai num fallback local, o painel
// continua funcionando (nunca quebra). Mesmo padrão de lib/deepseek.ts.
// ============================================================================

import { ARTICLE_CATEGORY_LIST, ARTICLE_CATEGORIES } from "@/lib/constants";
import { parseJsonLoose, SEO_LIMITS, type SeoMetadata } from "@/lib/seo-types";
import { clampText, toPlainText } from "@/lib/deepseek";
import {
  ensurePtBrText,
  keywordsPtBrToArray,
  normalizeKeywordsPtBr
} from "@/lib/ptbr";
import { slugify } from "@/lib/utils";
import type { ArticleCategory } from "@/lib/types";

const DEEPSEEK_URL =
  process.env.DEEPSEEK_API_URL?.trim() || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

/** Instrução fixa: o "redator jurídico + SEO" do projeto. */
const SYSTEM_PROMPT = `Você é redator sênior especializado em Propriedade Intelectual (PI), patentes, inovação e Transferência de Tecnologia, escrevendo para a consultoria de Bianca Martins (Brasil).

Sua tarefa: escolher um TEMA ATUAL E RELEVANTE do nicho e redigir um artigo completo, original, técnico e acessível.

IDIOMA (REGRA ABSOLUTA):
- Escreva TODO o conteúdo estritamente em PORTUGUÊS DO BRASIL (pt-BR): títulos, resumo, corpo, metadados de SEO e o prompt da imagem.
- NUNCA responda em inglês ou em qualquer outro idioma — nem em trechos, rótulos ou títulos de seção.
- Use ortografia e acentuação corretas do pt-BR. Mantenha termos técnicos consagrados (ex.: "know-how", "software", "NDA", "royalties", "due diligence") quando forem de uso corrente no mercado brasileiro.
- Tom profissional, técnico, claro e confiável, adequado ao mercado brasileiro de Propriedade Intelectual e Transferência de Tecnologia (sem sensacionalismo).

Regras de redação:
- Estrutura obrigatória em Markdown: uma introdução (sem título), depois seções com "## " (H2) e subseções com "### " (H3), e uma conclusão ("## Conclusão").
- 3 a 5 seções H2; pelo menos uma com subtítulos H3. De 700 a 1200 palavras.
- Parágrafos curtos, listas quando ajudar. NÃO repita o título dentro do corpo.
- NÃO invente leis, números, prazos, valores ou estatísticas específicas que você não tenha certeza. Prefira princípios gerais e boas práticas.
- SEO interno: inclua naturalmente as palavras-chave do nicho (propriedade intelectual, patente, transferência de tecnologia, inovação, licenciamento etc.), use H2/H3 descritivos e escreva uma introdução que responda à intenção de busca.

Regras de SEO (metadados):
- seo.meta_title: no MÁXIMO ${SEO_LIMITS.title} caracteres, palavra-chave principal no início, sem emojis/CAPS/aspas.
- seo.meta_description: no MÁXIMO ${SEO_LIMITS.description} caracteres, persuasiva, com chamada à ação implícita.
- seo.meta_keywords: 4 a ${SEO_LIMITS.keywords} termos separados por vírgula, minúsculos, com long tail.
- seo.og_title / seo.og_description: versões para redes sociais.
- image_prompt: descrição EM PORTUGUÊS DO BRASIL (1 a 2 frases) para gerar uma capa profissional e abstrata sobre o tema. Se houver qualquer texto na imagem, ele deve estar em pt-BR. Sem logos, estilo corporativo/jurídico/tecnológico, tons sóbrios (azul-marinho e dourado).
- category: um destes valores exatos: ${ARTICLE_CATEGORY_LIST.map((c) => `"${c.value}"`).join(", ")}.

Responda APENAS com um JSON válido (sem texto antes/depois):
{"title":"...","summary":"...","category":"...","content":"## ...\\n...","seo":{"meta_title":"...","meta_description":"...","meta_keywords":"...","og_title":"...","og_description":"..."},"image_prompt":"..."}`;

/** Entrada do gerador: um rumo opcional para o tema. */
export interface ArticleGenInput {
  /** Dica de tema/palavra-chave (opcional — a IA escolhe tendências se vazio). */
  topic?: string;
  /** Categoria desejada (opcional — a IA decide se vazio). */
  category?: ArticleCategory;
  /** Público-alvo / tom desejado (opcional). */
  audience?: string;
}

/** Resultado pronto para pré-preencher o formulário do painel. */
export interface ArticleDraft {
  title: string;
  slug: string;
  category: ArticleCategory;
  summary: string;
  /** Corpo em Markdown. */
  content: string;
  meta_description: string;
  tags: string[];
  seo: SeoMetadata;
  /** Prompt (pt-BR) sugerido para a capa. */
  image_prompt: string;
}

export interface ArticleGenResult {
  draft: ArticleDraft;
  /** `true` quando a resposta veio da API do DeepSeek. */
  fromAi: boolean;
  warning?: string;
}

const DEFAULT_CATEGORY: ArticleCategory = "propriedade-intelectual";

/** Normaliza a categoria devolvida pela IA para um valor válido do enum. */
function coerceCategory(value: unknown, fallback: ArticleCategory): ArticleCategory {
  const raw = String(value ?? "").trim() as ArticleCategory;
  return raw in ARTICLE_CATEGORIES ? raw : fallback;
}

/** Divide keywords em lista enxuta (tags), garantindo pt-BR e sem duplicatas. */
function splitKeywords(value: string): string[] {
  return keywordsPtBrToArray(value, 10);
}

/**
 * Fallback local: esqueleto de artigo útil mesmo sem IA.
 * Mantém o painel sempre funcional (sem quebra).
 */
export function heuristicArticle(input: ArticleGenInput): ArticleDraft {
  const topic =
    toPlainText(input.topic || "") ||
    "Propriedade Intelectual e Transferência de Tecnologia na prática";
  const category = coerceCategory(input.category, DEFAULT_CATEGORY);
  const catLabel = ARTICLE_CATEGORIES[category].label;

  const title = clampText(topic, SEO_LIMITS.title);
  const content = [
    `Este artigo apresenta uma visão prática sobre **${topic}**, no contexto de ${catLabel}. O objetivo é orientar decisões com segurança jurídica e estratégia de mercado.`,
    "",
    `## Por que ${topic} importa`,
    "",
    `Compreender ${topic} é essencial para transformar conhecimento em valor. Empresas, universidades e pesquisadores precisam de processos claros para proteger ativos e negociar contratos.`,
    "",
    "### Pontos de atenção",
    "",
    "- Identificação e proteção adequada dos ativos intangíveis;",
    "- Definição de titularidade e repartição de benefícios;",
    "- Estruturação contratual que reduza riscos.",
    "",
    "## Boas práticas",
    "",
    `Adotar uma abordagem estruturada para ${topic} reduz riscos e acelera a conexão pesquisa-mercado.`,
    "",
    "## Conclusão",
    "",
    "A estratégia de PI e transferência de tecnologia deve ser contínua. Um diagnóstico bem feito e contratos sob medida sustentam a inovação de ponta a ponta."
  ].join("\n");

  const metaTitle = clampText(title, SEO_LIMITS.title);
  const metaDescription = clampText(
    `${catLabel}: entenda ${topic} e as melhores práticas para proteger e negociar ativos de inovação com segurança jurídica.`,
    SEO_LIMITS.description
  );

  return {
    title,
    slug: slugify(title),
    category,
    summary: clampText(metaDescription, 158),
    content,
    meta_description: metaDescription,
    tags: splitKeywords(`propriedade intelectual, patentes, transferência de tecnologia, ${catLabel}`),
    seo: {
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: `propriedade intelectual, patentes, transferência de tecnologia, ${catLabel.toLowerCase()}`,
      og_title: metaTitle,
      og_description: metaDescription,
      source: "auto",
      generated_at: new Date().toISOString()
    },
    image_prompt:
      "Capa editorial profissional e abstrata sobre Propriedade Intelectual e Transferência de Tecnologia, em tons sóbrios de azul-marinho e dourado, com texturas sutis de redes e documentos, estilo corporativo e jurídico, sem logos. Nenhum texto legível na imagem."
  };
}

/** Monta o payload do usuário enviado ao modelo. */
function buildUserPrompt(input: ArticleGenInput): string {
  const lines = [
    "Gere um novo artigo do nicho de Propriedade Intelectual / Transferência de Tecnologia.",
    input.topic?.trim()
      ? `Tema/ideia sugerida (priorize este rumo): ${toPlainText(input.topic).slice(0, 300)}`
      : "Sem tema definido: escolha um tema ATUAL e relevante do nicho (ex.: patenteabilidade de software/IA, contratos de licenciamento, NDA em P&D, transferência universidade-empresa, marcas e proteção de dados).",
    input.category ? `Categoria desejada: ${input.category}` : "",
    input.audience?.trim() ? `Público-alvo: ${toPlainText(input.audience).slice(0, 200)}` : ""
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Gera um artigo completo (texto + SEO + prompt de capa) via DeepSeek.
 * Sempre devolve um `ArticleDraft` válido (fallback local se a IA falhar).
 */
export async function generateArticleWithAi(
  input: ArticleGenInput,
  signal?: AbortSignal
): Promise<ArticleGenResult> {
  const fallback = heuristicArticle(input);
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return {
      draft: fallback,
      fromAi: false,
      warning: "DEEPSEEK_API_KEY não configurada — artigo gerado por modelo local."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) }
        ],
        temperature: 0.75,
        max_tokens: 4000,
        response_format: { type: "json_object" },
        stream: false
      }),
      signal: controller.signal,
      cache: "no-store"
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        draft: fallback,
        fromAi: false,
        warning: `DeepSeek respondeu ${res.status}. ${detail.slice(0, 180)}`.trim()
      };
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonLoose(content);

    if (!parsed) {
      return {
        draft: fallback,
        fromAi: false,
        warning: "Resposta da IA não pôde ser interpretada — usando modelo local."
      };
    }

    const str = (k: string) =>
      typeof parsed[k] === "string" ? (parsed[k] as string).trim() : "";
    const seoRaw = (parsed.seo && typeof parsed.seo === "object"
      ? parsed.seo
      : {}) as Record<string, unknown>;
    const seoStr = (k: string) =>
      typeof seoRaw[k] === "string" ? (seoRaw[k] as string).trim() : "";

    // Garante pt-BR em todos os campos textuais vindos da IA, caindo para o
    // fallback (heurístico, já 100% pt-BR) sempre que um campo sair vazio ou
    // aparentar estar em outro idioma (ver lib/ptbr.ts).
    const title = clampText(ensurePtBrText(str("title"), fallback.title), 120);
    const category = coerceCategory(parsed.category, input.category ?? fallback.category);
    const summary = clampText(ensurePtBrText(str("summary"), fallback.summary), 200);
    const body = ensurePtBrText(str("content"), fallback.content) || fallback.content;

    const metaTitle = clampText(
      ensurePtBrText(seoStr("meta_title"), title),
      SEO_LIMITS.title
    );
    const metaDescription = clampText(
      ensurePtBrText(seoStr("meta_description"), summary || fallback.meta_description),
      SEO_LIMITS.description
    );
    const metaKeywords =
      normalizeKeywordsPtBr(seoStr("meta_keywords")) ||
      normalizeKeywordsPtBr(fallback.seo.meta_keywords) ||
      fallback.seo.meta_keywords ||
      "";
    const imagePrompt = ensurePtBrText(str("image_prompt"), fallback.image_prompt);

    return {
      draft: {
        title,
        slug: slugify(title),
        category,
        summary,
        content: body,
        meta_description: metaDescription,
        tags: splitKeywords(metaKeywords),
        seo: {
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords,
          og_title: clampText(
            ensurePtBrText(seoStr("og_title"), metaTitle),
            SEO_LIMITS.title
          ),
          og_description: clampText(
            ensurePtBrText(seoStr("og_description"), metaDescription),
            SEO_LIMITS.description
          ),
          source: "ai",
          generated_at: new Date().toISOString()
        },
        image_prompt: imagePrompt || fallback.image_prompt
      },
      fromAi: true
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      draft: fallback,
      fromAi: false,
      warning: aborted
        ? "A geração por IA excedeu o tempo limite — usando modelo local."
        : "Falha ao contatar a API do DeepSeek — usando modelo local."
    };
  } finally {
    clearTimeout(timeout);
  }
}



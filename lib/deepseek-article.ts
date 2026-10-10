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
import { markdownToHtml, sanitizeRichHtml } from "@/lib/rich-html";
import { slugify } from "@/lib/utils";
import type { ArticleCategory } from "@/lib/types";
import {
  findDuplicateTitle,
  makeUniqueTitle,
  pickReferenceTitles
} from "@/lib/article-dedup";

const DEEPSEEK_URL =
  process.env.DEEPSEEK_API_URL?.trim() || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
/** Quantos títulos já publicados são enviados ao modelo para evitar repetição. */
const MAX_REFERENCE_TITLES = 40;

/** Instrução fixa: o "redator jurídico + SEO" do projeto. */
const SYSTEM_PROMPT = `Você é redator sênior especializado em Propriedade Intelectual (PI), patentes, inovação e Transferência de Tecnologia, escrevendo para a consultoria de Bianca Martins (Brasil).

Sua tarefa: escolher um TEMA ATUAL E RELEVANTE do nicho e redigir um artigo completo, original, técnico e acessível, seguindo rigorosamente as normas de escrita e formatação da ABNT adaptadas para a web.

IDIOMA (REGRA ABSOLUTA):
- Escreva TODO o conteúdo estritamente em PORTUGUÊS DO BRASIL (pt-BR): títulos, resumo, corpo, metadados de SEO e o prompt da imagem.
- NUNCA responda em inglês ou em qualquer outro idioma — nem em trechos, rótulos ou títulos de seção.
- Use ortografia e acentuação corretas do pt-BR. Mantenha termos técnicos consagrados (ex.: "know-how", "software", "NDA", "royalties", "due diligence") quando forem de uso corrente no mercado brasileiro.

FORMATO DA SAÍDA (REGRA ABSOLUTA) — HTML SEMÂNTICO, NÃO MARKDOWN:
- Devolva o campo "content" como HTML LIMPO e SEMÂNTICO, pronto para o CKEditor 5 renderizar e editar visualmente.
- Use EXCLUSIVAMENTE estas tags: <p>, <h2>, <h3>, <strong>, <em>, <ul>, <ol>, <li>, <blockquote>. Opcionalmente <a href="..."> para referências.
- NUNCA use Markdown (nada de "#", "##", "**", "- ", "* ", "1. ") nem quebras de linha (\n) para separar blocos: cada bloco é um <p> e cada seção é um <h2>/<h3>.
- NUNCA use <h1> (o título é campo separado), <div>, <span>, classes, ids ou estilos inline (style="...").
- NÃO envolva todo o HTML em uma única tag pai; devolva os blocos em sequência.

NORMAS DE ESCRITA (ABNT — NBR 6022/6028/10520/14724, adaptadas à web):
- LINGUAGEM FORMAL E IMPESSOAL: empregue a norma culta da língua portuguesa, em registro técnico, acadêmico-profissional e impessoal. Use construções impessoais e a 3ª pessoa (ex.: "observa-se", "é necessário", "cabe destacar"). NUNCA use 1ª pessoa ("eu", "nós", "acho", "nossa") nem linguagem coloquial, gírias, superlativos vazios, emojis ou perguntas retóricas.
- ESTRUTURAÇÃO LÓGICA OBRIGATÓRIA: (a) introdução contextualizada em <p> (aborda o problema e a relevância, sem repetir o título e sem cabeçalho próprio); (b) desenvolvimento fundamentado com 3 a 5 seções em <h2> e, em pelo menos uma, subseções em <h3>; (c) conclusão clara iniciada por <h2>Conclusão</h2>, retomando as ideias centrais sem temas novos.
- PROGRESSÃO E COESÃO: encadeie as ideias com conectivos formais; use <ul>/<ol> e <li> para enumerações (requisitos, etapas, ativos) quando melhorar a clareza. Parágrafos concisos (2 a 5 períodos).
- CITAÇÕES E REFERÊNCIAS (ABNT NBR 10520): cite a legislação de forma completa na 1ª ocorrência (ex.: "Lei nº 9.279, de 14 de maio de 1996" ou "Lei nº 9.279/1996"); cite órgãos pelo nome e sigla entre parênteses (ex.: "Instituto Nacional da Propriedade Industrial (INPI)"); cite normativas/tratados pelo nome. Para citações no corpo, use o sistema autor-data ABNT (AUTOR, ano).
- RIGOR E VERACIDADE: NÃO invente leis, artigos, prazos, valores, estatísticas, datas ou citações incertas. Sem certeza de um dado, prefira princípios gerais, boas práticas e a menção ao órgão/norma competente sem números inventados.

SEO INTERNO: inclua naturalmente as palavras-chave do nicho (propriedade intelectual, patente, transferência de tecnologia, inovação, licenciamento), use <h2>/<h3> descritivos e escreva a introdução respondendo à intenção de busca. NÃO repita o título no corpo.

ORIGINALIDADE (REGRA ABSOLUTA — EVITE DUPLICIDADE):
- É TERMINANTEMENTE PROIBIDO reproduzir, parafrasear de perto ou reescrever um tema/título já existente.
- O prompt informará uma lista de ARTIGOS JÁ PUBLICADOS. Escolha obrigatoriamente um tema, ângulo, recorte e título que NÃO coincidam (nem por sinônimos nem por variação de redação) com nenhum item dessa lista.
- Se o tema sugerido pelo usuário já estiver coberto, aborde um ASPECTO DIFERENTE e específico dele (ex.: em vez de "Licenciamento de Patentes", escreva sobre "Cláusulas de royalties e auditoria em contratos de licenciamento de patentes").
- O campo "title" deve ser claramente DISTINTO de todos os títulos da lista. Em caso de dúvida, prefira um título mais específico/long tail.

Regras de SEO (metadados):
- seo.meta_title: no MÁXIMO ${SEO_LIMITS.title} caracteres, palavra-chave principal no início, sem emojis/CAPS/aspas.
- seo.meta_description: no MÁXIMO ${SEO_LIMITS.description} caracteres, persuasiva, com chamada à ação implícita.
- seo.meta_keywords: 4 a ${SEO_LIMITS.keywords} termos separados por vírgula, minúsculos, com long tail.
- seo.og_title / seo.og_description: versões para redes sociais.
- image_prompt: descrição EM PORTUGUÊS DO BRASIL (1 a 2 frases) para gerar uma capa profissional e abstrata sobre o tema. Texto na imagem, se houver, em pt-BR. Sem logos, estilo corporativo/jurídico/tecnológico, tons sóbrios (azul-marinho e dourado).
- category: um destes valores exatos: ${ARTICLE_CATEGORY_LIST.map((c) => `"${c.value}"`).join(", ")}.

Responda APENAS com um JSON válido (sem texto antes/depois). O campo "content" deve conter o HTML semântico completo:
{\"title\":\"...\",\"summary\":\"...\",\"category\":\"...\",\"content\":\"<p>...</p><h2>...</h2><p>...</p><h3>...</h3><ul><li>...</li></ul><h2>Conclusão</h2><p>...</p>\",\"seo\":{\"meta_title\":\"...\",\"meta_description\":\"...\",\"meta_keywords\":\"...\",\"og_title\":\"...\",\"og_description\":\"...\"},\"image_prompt\":\"...\"}`;

/** Entrada do gerador: um rumo opcional para o tema. */
export interface ArticleGenInput {
  /** Dica de tema/palavra-chave (opcional — a IA escolhe tendências se vazio). */
  topic?: string;
  /** Categoria desejada (opcional — a IA decide se vazio). */
  category?: ArticleCategory;
  /** Público-alvo / tom desejado (opcional). */
  audience?: string;
  /**
   * Títulos de artigos JÁ EXISTENTES (publicados ou em rascunho).
   * Usados para (a) instruir a IA a não repetir o tema e (b) validar o título
   * gerado, evitando duplicidades. Ver lib/article-dedup.ts.
   */
  existingTitles?: string[];
}

/** Resultado pronto para pré-preencher o formulário do painel. */
export interface ArticleDraft {
  title: string;
  slug: string;
  category: ArticleCategory;
  summary: string;
  /** Corpo em HTML semântico (ABNT), pronto para o CKEditor 5. */
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
  /**
   * Preenchido quando o título gerado colidiu com um artigo já existente e a
   * unicidade só pôde ser obtida por ajuste automático do título.
   * `null` ⇒ nenhuma duplicidade persistente (a IA acertou ou foi corrigida).
   */
  duplicate?: { matchedTitle: string; finalTitle: string } | null;
}

const DEFAULT_CATEGORY: ArticleCategory = "propriedade-intelectual";
/**
 * Normaliza o corpo gerado pela IA para HTML semântico seguro (CKEditor 5).
 * Degrada com elegância: se a IA devolver Markdown por engano, converte para
 * HTML; em seguida aplica a allowlist de sanitização do projeto (remove
 * scripts/estilos e tags não permitidas), garantindo HTML limpo para edição
 * visual e exibição no site.
 */
function ensureAbntHtml(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const html = markdownToHtml(raw);
  return sanitizeRichHtml(html);
}

/** Garante que o corpo tenha pelo menos um parágrafo (evita conteúdo vazio). */
function wrapIfPlain(html: string): string {
  const src = String(html ?? "").trim();
  if (!src) return "";
  return /<(p|h2|h3|ul|ol|blockquote)\b/i.test(src) ? src : `<p>${src}</p>`;
}

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
    `<p>Este artigo apresenta uma análise técnica sobre <strong>${topic}</strong>, no contexto de ${catLabel}. Objetiva-se orientar decisões com segurança jurídica e estratégia de mercado, à luz das normas aplicáveis.</p>`,
    `<h2>Por que ${topic} importa</h2>`,
    `<p>Compreender ${topic} é condição essencial para converter conhecimento em valor. Empresas, universidades e pesquisadores demandam processos claros para proteger ativos intangíveis e negociar contratos.</p>`,
    `<h3>Pontos de atenção</h3>`,
    "<ul>",
    "<li>Identificação e proteção adequada dos ativos intangíveis;</li>",
    "<li>Definição de titularidade e repartição de benefícios;</li>",
    "<li>Estruturação contratual que reduza riscos;</li>",
    "</ul>",
    "<h2>Boas práticas</h2>",
    `<p>A adoção de abordagem estruturada para ${topic} reduz riscos e acelera a conexão entre pesquisa e mercado, conforme diretrizes do Instituto Nacional da Propriedade Industrial (INPI).</p>`,
    "<h2>Conclusão</h2>",
    `<p>A estratégia de Propriedade Intelectual e de transferência de tecnologia deve ser contínua. Diagnóstico criterioso e instrumentos contratuais adequados sustentam a inovação de ponta a ponta.</p>`
  ].join("");

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
  // Títulos já existentes: instrui a IA a NÃO repetir o tema (anti-duplicidade).
  const referenceTitles = pickReferenceTitles(input.existingTitles ?? [], MAX_REFERENCE_TITLES);
  const avoidBlock = referenceTitles.length
    ? [
        "",
        "ARTIGOS JÁ PUBLICADOS (proibido repetir o tema/título — escolha algo novo):",
        ...referenceTitles.map((t) => `- ${t}`),
        "O título gerado deve ser claramente diferente de TODOS os itens acima."
      ]
    : [];

  const lines = [
    "Gere um novo artigo do nicho de Propriedade Intelectual / Transferência de Tecnologia.",
    "Formato obrigatório do campo \"content\": HTML semântico (<p>, <h2>, <h3>, <strong>, <em>, <ul>/<ol>/<li>, <blockquote>), sem Markdown e sem quebras de linha para separar blocos.",
    "Escreva em português do Brasil, com linguagem formal e impessoal (norma culta, 3ª pessoa), na estrutura ABNT: introdução contextualizada, desenvolvimento em seções <h2>/<h3> e conclusão em <h2>Conclusão</h2>. Cite leis e órgãos corretamente (ex.: Lei nº 9.279/1996; INPI).",
    input.topic?.trim()
      ? `Tema/ideia sugerida (priorize este rumo): ${toPlainText(input.topic).slice(0, 300)}`
      : "Sem tema definido: escolha um tema ATUAL e relevante do nicho (ex.: patenteabilidade de software/IA, contratos de licenciamento, NDA em P&D, transferência universidade-empresa, marcas e proteção de dados).",
    input.category ? `Categoria desejada: ${input.category}` : "",
    input.audience?.trim() ? `Público-alvo: ${toPlainText(input.audience).slice(0, 200)}` : "",
    ...avoidBlock
  ].filter(Boolean);
  return lines.join("\n");
}

/** Executa UMA chamada ao DeepSeek e devolve o JSON já parseado (ou null). */
async function callDeepSeek(
  input: ArticleGenInput,
  apiKey: string,
  signal: AbortSignal,
  extraInstruction?: string
): Promise<Record<string, unknown> | null> {
  const userPrompt = extraInstruction
    ? `${buildUserPrompt(input)}\n\nCORREÇÃO OBRIGATÓRIA: ${extraInstruction}`
    : buildUserPrompt(input);

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
        { role: "user", content: userPrompt }
      ],
      temperature: 0.75,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      stream: false
    }),
    signal,
    cache: "no-store"
  });

  if (!res.ok) return null;
  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return parseJsonLoose(payload.choices?.[0]?.message?.content ?? "");
}

/**
 * Gera um artigo completo (texto + SEO + prompt de capa) via DeepSeek.
 * Sempre devolve um `ArticleDraft` válido (fallback local se a IA falhar).
 * Quando `input.existingTitles` é informado, o título gerado passa por uma
 * validação anti-duplicidade (com uma nova tentativa e ajuste final do título).
 */
export async function generateArticleWithAi(
  input: ArticleGenInput,
  signal?: AbortSignal
): Promise<ArticleGenResult> {
  const fallback = heuristicArticle(input);
  const existingTitles = (input.existingTitles ?? []).filter(Boolean);
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return {
      draft: guardAgainstDuplicate(fallback, existingTitles),
      fromAi: false,
      warning: "DEEPSEEK_API_KEY não configurada — artigo gerado por modelo local."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    let parsed = await callDeepSeek(input, apiKey, controller.signal);

    if (!parsed) {
      return {
        draft: guardAgainstDuplicate(fallback, existingTitles),
        fromAi: false,
        warning: "Resposta da IA não pôde ser interpretada — usando modelo local."
      };
    }

    const readTitle = (obj: Record<string, unknown>) =>
      clampText(ensurePtBrText(typeof obj.title === "string" ? obj.title : "", ""), 120);

    // 1ª validação: se o título repetir um artigo existente, pede uma NOVA
    // tentativa à IA, reforçando explicitamente o título que deve ser evitado.
    let aiTitle = readTitle(parsed);
    let repeated = findDuplicateTitle(aiTitle, existingTitles);
    if (repeated) {
      const retry = await callDeepSeek(
        input,
        apiKey,
        controller.signal,
        `O título "${aiTitle}" repete o tema do artigo já existente "${repeated.title}". ` +
          "Gere um artigo sobre um TEMA DIFERENTE e devolva um título claramente distinto."
      );
      const retryTitle = retry ? readTitle(retry) : "";
      // Só aceita a nova tentativa se realmente resolveu a colisão.
      if (retry && retryTitle && !findDuplicateTitle(retryTitle, existingTitles)) {
        parsed = retry;
        repeated = null;
      }
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
    // 2ª validação (último recurso): se a IA insistiu no tema repetido, ajusta
    // o título para uma variação única — nunca gravamos um título duplicado.
    let title = clampText(ensurePtBrText(str("title"), fallback.title), 120);
    let duplicate: { matchedTitle: string; finalTitle: string } | null = null;
    if (existingTitles.length && findDuplicateTitle(title, existingTitles)) {
      const matched = repeated?.title ?? title;
      const unique = makeUniqueTitle(title, existingTitles);
      duplicate = { matchedTitle: matched, finalTitle: unique };
      title = unique;
    }
    const category = coerceCategory(parsed.category, input.category ?? fallback.category);
    const summary = clampText(ensurePtBrText(str("summary"), fallback.summary), 200);
    // Corpo: garante pt-BR e converte/sanitiza para HTML semântico (ABNT).
    const bodyRaw = ensurePtBrText(str("content"), fallback.content) || fallback.content;
    const body = wrapIfPlain(ensureAbntHtml(bodyRaw)) || fallback.content;

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
      fromAi: true,
      duplicate
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      draft: guardAgainstDuplicate(fallback, existingTitles),
      fromAi: false,
      warning: aborted
        ? "A geração por IA excedeu o tempo limite — usando modelo local."
        : "Falha ao contatar a API do DeepSeek — usando modelo local."
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Rede de segurança para os caminhos de fallback (sem IA): garante que o título
 * do rascunho local não colida com um artigo já existente.
 */
function guardAgainstDuplicate(draft: ArticleDraft, existingTitles: string[]): ArticleDraft {
  if (!existingTitles.length) return draft;
  if (!findDuplicateTitle(draft.title, existingTitles)) return draft;
  const unique = makeUniqueTitle(draft.title, existingTitles);
  return { ...draft, title: unique, slug: slugify(unique) };
}



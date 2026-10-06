// ============================================================================
// Cliente da API do DeepSeek (formato compatível com OpenAI).
// Sem SDK externo: apenas fetch nativo — reduz dependências e funciona no
// runtime Node das Server Actions / Route Handlers.
//
// Fluxo: generateSeoWithAi() tenta a IA; se falhar (sem chave, timeout, erro
// HTTP, JSON inválido) devolve um resultado heurístico local. O painel SEMPRE
// recebe algo utilizável — o site nunca quebra por indisponibilidade da IA.
// ============================================================================

import {
  parseJsonLoose,
  type SeoMetadata,
  SEO_LIMITS
} from "@/lib/seo-types";

const DEEPSEEK_URL =
  process.env.DEEPSEEK_API_URL?.trim() || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

/** Instrução fixa: o "SEO strategist" do projeto. */
const SYSTEM_PROMPT = `Você é um especialista sênior em SEO e marketing de conteúdo jurídico brasileiro.
Escreve para a consultoria de Bianca Martins — Transferência de Tecnologia & Propriedade Intelectual (Brasil).
Sua tarefa é otimizar metadados para mecanismos de busca, priorizando intenção de busca, clareza e CTR.

Regras obrigatórias:
- meta_title: no MÁXIMO ${SEO_LIMITS.title} caracteres, com a palavra-chave principal no início, sem emojis, sem CAPS LOCK, sem aspas.
- meta_description: no MÁXIMO ${SEO_LIMITS.description} caracteres, persuasiva, com chamada à ação implícita e idioma português do Brasil.
- meta_keywords: de 4 a ${SEO_LIMITS.keywords} termos separados por vírgula, em minúsculas, focados em intenção de busca (long tail incluído).
- og_title e og_description: versões para redes sociais (podem ser levemente mais comerciais).
Não invente dados, prazos, preços, números ou credenciais que não estejam no conteúdo fornecido.

Responda APENAS com um objeto JSON válido, sem texto antes ou depois, no formato:
{"meta_title":"...","meta_description":"...","meta_keywords":"termo1, termo2","og_title":"...","og_description":"..."}`;

export interface SeoSourceInput {
  /** Título bruto do conteúdo (usado como semente). */
  title: string;
  /** Texto principal (resumo, descrição, corpo, etc.). */
  body: string;
  /** Rótulo curto do tipo de conteúdo (ex.: "Página de atuação"). */
  kind?: string;
  /** Contexto extra (seção do site, categoria, URL). */
  context?: string;
}

export interface SeoGenerationResult {
  seo: SeoMetadata;
  /** `true` quando a resposta veio da API do DeepSeek. */
  fromAi: boolean;
  /** Mensagem de aviso quando houve fallback heurístico. */
  warning?: string;
}

/** Remove HTML/Markdown e normaliza espaços em texto simples. */
export function toPlainText(src: string): string {
  return String(src ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~#>|]/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Corta em um limite de caracteres respeitando a última palavra inteira. */
export function clampText(src: string, limit: number): string {
  const text = String(src ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > Math.floor(limit * 0.6) ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[,;:.\-–—]$/, "")}`.trim();
}

/** Gera keywords a partir do título + corpo (fallback e complemento). */
export function buildKeywords(title: string, body: string, limit = SEO_LIMITS.keywords): string {
  const text = `${title} ${title} ${toPlainText(body)}`.toLowerCase();
  const words = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([w]) => w);

  // Complementa com termos de domínio do nicho (melhora o long tail).
  const domain = [
    "transferencia de tecnologia",
    "propriedade intelectual",
    "patentes",
    "inovacao",
    "contratos"
  ];

  return [...new Set([...ranked.slice(0, limit), ...domain.slice(0, 2)])]
    .slice(0, limit + 2)
    .join(", ");
}

/** Resultado heurístico local — usado quando a IA está indisponível. */
export function heuristicSeo(input: SeoSourceInput): SeoMetadata {
  const title = toPlainText(input.title) || toPlainText(input.body).slice(0, 60);
  const metaTitle = clampText(title, SEO_LIMITS.title).replace(/[.。]+$/, "");
  const cleanBody = toPlainText(input.body);

  // Primeira frase que caiba no limite, com call-to-action quando sobrar espaço.
  const firstSentence = cleanBody.split(/(?<=[.!?])\s+/)[0] || cleanBody;
  let metaDescription = clampText(
    firstSentence.length > 60 ? firstSentence : cleanBody,
    SEO_LIMITS.description
  );
  if (metaDescription.length < SEO_LIMITS.description - 25) {
    metaDescription = clampText(
      `${metaDescription} Fale com a Bianca Martins e estruture sua estratégia.`,
      SEO_LIMITS.description
    );
  }

  return {
    meta_title: metaTitle,
    meta_description: metaDescription,
    meta_keywords: buildKeywords(title, cleanBody),
    og_title: clampText(metaTitle, SEO_LIMITS.title),
    og_description: metaDescription,
    source: "auto"
  };
}

/** Monta o payload do usuário enviado ao modelo. */
function buildUserPrompt(input: SeoSourceInput): string {
  const body = toPlainText(input.body).slice(0, 6000);
  return [
    input.kind ? `Tipo de conteúdo: ${input.kind}` : "",
    input.context ? `Contexto/URL: ${input.context}` : "",
    `Título atual: ${toPlainText(input.title) || "(sem título)"}`,
    "",
    "Conteúdo:",
    body || "(conteúdo vazio — otimize com base apenas no título)"
  ]
    .filter(Boolean)
    .join("\n");
}
/** Palavras vazias ignoradas na extração de keywords. */
const STOPWORDS = new Set([
  "a","o","as","os","de","da","do","das","dos","e","em","um","uma","uns","umas","que",
  "com","por","para","no","na","nos","nas","se","ao","aos","sua","seu","suas","seus",
  "como","mais","entre","sobre","quando","onde","porque","também","ja","já","são","ser",
  "sou","está","estão","foi","serão","esse","essa","isso","este","esta","pelo","pela"
]);

/**
 * Chama a API do DeepSeek e devolve metadados SEO normalizados.
 * `signal` permite cancelar (timeout) por parte do chamador.
 */
export async function generateSeoWithAi(
  input: SeoSourceInput,
  signal?: AbortSignal
): Promise<SeoGenerationResult> {
  const fallback = heuristicSeo(input);
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return {
      seo: fallback,
      fromAi: false,
      warning:
        "DEEPSEEK_API_KEY não configurada — metadados gerados por heurística local."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
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
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: "json_object" },
        stream: false
      }),
      signal: controller.signal,
      cache: "no-store"
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        seo: fallback,
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
        seo: fallback,
        fromAi: false,
        warning: "Resposta da IA não pôde ser interpretada — usando heurística local."
      };
    }

    const str = (k: string) =>
      typeof parsed[k] === "string" ? (parsed[k] as string).trim() : "";
    const metaTitle = clampText(str("meta_title") || fallback.meta_title!, SEO_LIMITS.title);
    const metaDescription = clampText(
      str("meta_description") || fallback.meta_description!,
      SEO_LIMITS.description
    );

    return {
      seo: {
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: str("meta_keywords") || fallback.meta_keywords,
        og_title: clampText(str("og_title") || metaTitle, SEO_LIMITS.title),
        og_description: clampText(
          str("og_description") || metaDescription,
          SEO_LIMITS.description
        ),
        source: "ai",
        generated_at: new Date().toISOString()
      },
      fromAi: true
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      seo: fallback,
      fromAi: false,
      warning: aborted
        ? "A geração por IA excedeu o tempo limite — usando heurística local."
        : "Falha ao contatar a API do DeepSeek — usando heurística local."
    };
  } finally {
    clearTimeout(timeout);
  }
}



// ============================================================================
// Tipos compartilhados do SEO dinâmico (banco + painel + site público).
// A coluna `seo_metadata` (jsonb) guarda exatamente este objeto em cada
// tabela editável (services, articles, page_contents).
// ============================================================================

/** Metadados de SEO editáveis por página/conteúdo. */
export interface SeoMetadata {
  /** Título otimizado (idealmente até 60 caracteres). */
  meta_title?: string;
  /** Descrição persuasiva (idealmente até 160 caracteres). */
  meta_description?: string;
  /** Palavras-chave separadas por vírgula (ou array ao persistir). */
  meta_keywords?: string;
  /** Texto do Open Graph (cai para meta_title quando vazio). */
  og_title?: string;
  /** Descrição do Open Graph (cai para meta_description quando vazio). */
  og_description?: string;
  /** URL absoluta ou relativa da imagem de compartilhamento. */
  og_image?: string;
  /** Origem do último preenchimento — útil para o painel/auditoria. */
  source?: "ai" | "manual" | "auto";
  /** ISO da última geração automática por IA. */
  generated_at?: string;
}

/** Limites recomendados pelas boas práticas de ranqueamento. */
export const SEO_LIMITS = {
  title: 60,
  description: 160,
  keywords: 8
} as const;

/** Normaliza qualquer valor vindo do banco em um SeoMetadata seguro. */
export function normalizeSeoMetadata(input: unknown): SeoMetadata {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const out: SeoMetadata = {};
  const title = str(raw.meta_title);
  const description = str(raw.meta_description);
  const keywords = Array.isArray(raw.meta_keywords)
    ? (raw.meta_keywords as unknown[]).map((k) => String(k).trim()).filter(Boolean).join(", ")
    : str(raw.meta_keywords);
  const ogTitle = str(raw.og_title);
  const ogDescription = str(raw.og_description);
  const ogImage = str(raw.og_image);
  const source = str(raw.source);
  const generatedAt = str(raw.generated_at);

  if (title) out.meta_title = title;
  if (description) out.meta_description = description;
  if (keywords) out.meta_keywords = keywords;
  if (ogTitle) out.og_title = ogTitle;
  if (ogDescription) out.og_description = ogDescription;
  if (ogImage) out.og_image = ogImage;
  if (source === "ai" || source === "manual" || source === "auto") out.source = source;
  if (generatedAt) out.generated_at = generatedAt;
  return out;
}

/**
 * Extrai o JSON de uma resposta possivelmente embrulhada em ```json … ```
 * ou com texto ao redor. Retorna `null` quando nada é parseável.
 */
export function parseJsonLoose(text: string): Record<string, unknown> | null {
  const src = String(text ?? "").trim();
  if (!src) return null;
  const fenced = src.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : src).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

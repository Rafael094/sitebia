// ============================================================================
// Garantia de IDIOMA (Português do Brasil) para conteúdo gerado por IA.
// ----------------------------------------------------------------------------
// Todo texto produzido pela IA (títulos, corpo, resumos, SEO, prompt de capa)
// deve sair estritamente em pt-BR, com tom profissional/técnico. Este módulo
// concentra as rotinas de limpeza e validação usadas no pipeline de geração,
// para que a regra fique num único lugar e seja fácil de manter.
//
// Estratégia em duas camadas:
//   1) Instrução forte no prompt (a IA já é mandada responder em pt-BR);
//   2) Saneamento determinístico do resultado (aqui) — evita vazamentos óbvios
//      de outro idioma e normaliza acentos/pontuação/caracteres estranhos.
// ============================================================================

/**
 * Sequência de palavras/rótulos em INGLÊS que costumam vazar quando o modelo
 * "escorrega" de idioma (ex.: "Title:", "Introduction", "Conclusion"). São
 * indicações fortes, não uma lista exaustiva — o foco é capturar os casos mais
 * comuns em respostas estruturadas.
 */
const FOREIGN_MARKERS = [
  /\bintroduction\b/i,
  /\bconclusion\b/i,
  /\boverview\b/i,
  /\bsummary\b/i,
  /\bkey\s+takeaways?\b/i,
  /\btitle\s*:/i,
  /\bdescription\s*:/i,
  /\bkeywords?\s*:/i,
  /\bthe\s+following\b/i
];

/**
 * Heurística conservadora: `true` quando o texto PARECE conter inglês suficiente
 * para ser considerado fora do padrão pt-BR. Usa marcadores de alto sinal e a
 * proporção de stopwords inglesas — evita falsos positivos em termos técnicos
 * (ex.: "software", "NDA", "know-how"), que são correntes no nicho.
 */
export function looksNonPtBr(value: string): boolean {
  const text = normalizeSpaces(value);
  if (text.length < 24) return false;
  if (FOREIGN_MARKERS.some((re) => re.test(text))) return true;

  // Stopwords inglesas muito comuns (não usadas como termos técnicos isolados).
  const englishStops = (text.toLowerCase().match(/\b(the|and|of|with|for|this|that|from|into|about)\b/g) ?? []).length;
  const words = (text.match(/[A-Za-zÀ-ÿ]+/g) ?? []).length || 1;
  return englishStops / words > 0.15;
}

/** Colapsa espaços, remove BOM/zero-width e normaliza espaços ao redor de pontuação. */
export function normalizeSpaces(value: string): string {
  return String(value ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

/**
 * Remove prefixos de rótulo em inglês que o modelo pode incluir (ex.: "Title: ").
 * Mantém o restante do texto intacto.
 */
export function stripForeignLabels(value: string): string {
  return String(value ?? "")
    .replace(/^\s*(title|summary|description|keywords?|introduction|conclusion|overview)\s*:\s*/i, "")
    .trim();
}

/**
 * Sanea um campo de texto gerado pela IA garantindo pt-BR básico:
 *  - remove BOM/zero-width e rótulos de idioma;
 *  - colapsa espaços;
 *  - se estiver vazio, usa `fallback`;
 *  - se PARECER não pt-BR, prefere o `fallback` (pt-BR garantido pela heurística).
 */
export function ensurePtBrText(value: unknown, fallback = ""): string {
  const cleaned = normalizeSpaces(stripForeignLabels(typeof value === "string" ? value : ""));
  if (!cleaned) return normalizeSpaces(fallback);
  if (looksNonPtBr(cleaned)) return normalizeSpaces(fallback || cleaned);
  return cleaned;
}

/**
 * Normaliza a lista de palavras-chave em pt-BR: minúsculas, sem duplicatas,
 * sem espaços extras e com limite de itens. Mantém a ordem de relevância.
 */
export function normalizeKeywordsPtBr(value: unknown, max = 12): string {
  const raw = typeof value === "string" ? value : "";
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;|]/)) {
    const term = normalizeSpaces(part).toLowerCase().replace(/^["']|["']$/g, "");
    if (term.length < 2 || seen.has(term)) continue;
    seen.add(term);
    out.push(term);
    if (out.length >= max) break;
  }
  return out.join(", ");
}

/** Divide uma string de keywords em array (mesma regra de normalizeKeywordsPtBr). */
export function keywordsPtBrToArray(value: unknown, max = 12): string[] {
  const normalized = normalizeKeywordsPtBr(value, max);
  return normalized ? normalized.split(", ") : [];
}

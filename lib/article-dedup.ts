// ============================================================================
// Deduplicação de TEMA/TÍTULO de artigos gerados por IA.
// ----------------------------------------------------------------------------
// Problema resolvido: ao gerar um artigo sem informar o tema, a IA costuma
// escolher a mesma "tendência" repetidas vezes, criando dois artigos iguais.
//
// Este módulo concentra a detecção determinística de duplicidade (sem dependência
// externa), usada em duas frentes:
//   1) ANTES da geração: os títulos já existentes são enviados no prompt para a
//      IA evitar repeti-los;
//   2) DEPOIS da geração: o título devolvido é comparado com os existentes e,
//      se colidir, a IA é reexecutada ou o título é ajustado.
//
// A comparação é feita em duas camadas de força decrescente:
//   - slug idêntico (colisão exata de URL);
//   - similaridade de conteúdo (Jaccard + contenção de tokens), tolerante a
//     variações de caixa, acento, pontuação e palavras vazias.
// ============================================================================

import { slugify } from "@/lib/utils";

/** Limite padrão de similaridade (Jaccard) a partir do qual dois títulos são
 * considerados duplicados. 0.6 captura "quase o mesmo tema" sem gerar falsos
 * positivos entre artigos do mesmo nicho. */
export const DEFAULT_SIMILARITY_THRESHOLD = 0.6;

/**
 * Sufixos qualificadores usados por `makeUniqueTitle` para desambiguar um tema.
 * Um título que termina com um destes é, por construção, a variação "novo
 * ângulo" do tema base — logo não deve ser tratado como duplicata do base.
 */
const DISAMBIGUATOR_SUFFIXES = [
  "parte 2",
  "parte 3",
  "parte 4",
  "abordagem prática",
  "abordagem pratica",
  "análise aprofundada",
  "analise aprofundada"
];

/** `true` quando o título traz um sufixo desambiguador acrescentado por nós. */
function hasDisambiguator(title: string): boolean {
  const n = normalizeForCompare(title);
  return DISAMBIGUATOR_SUFFIXES.some((s) => n.endsWith(s));
}

/** Remove um eventual sufixo desambiguador do texto normalizado. */
function stripDisambiguator(title: string): string {
  let n = normalizeForCompare(title);
  for (const s of DISAMBIGUATOR_SUFFIXES) {
    if (n.endsWith(s)) {
      n = n.slice(0, n.length - s.length).trim();
      break;
    }
  }
  return n;
}

/**
 * Palavras vazias (pt-BR + termos genéricos do nicho) ignoradas na comparação.
 * Termos como "patente"/"propriedade intelectual" aparecem em quase todo artigo
 * do blog e não devem, sozinhos, caracterizar duplicidade.
 */
const STOPWORDS = new Set([
  "a","o","as","os","de","da","do","das","dos","e","em","um","uma","uns","umas",
  "que","com","por","para","no","na","nos","nas","se","ao","aos","sua","seu",
  "suas","seus","como","mais","entre","sobre","quando","onde","porque","também",
  "ja","já","são","ser","pelo","pela","guia","artigo","dicas","pratica",
  "prático","praticas","práticas","entenda","tudo","voce","você","importa",
  "importancia","importância","papel","caso","casos"
]);

/** Normaliza um texto para comparação: sem acento, minúsculo, só letras/números. */
export function normalizeForCompare(value: string): string {
  return slugify(String(value ?? "")).replace(/-/g, " ");
}

/** Extrai os tokens significativos (sem stopwords) de um título. */
export function titleTokens(value: string): string[] {
  return normalizeForCompare(value)
    .split(" ")
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Índice de similaridade de Jaccard entre dois conjuntos de tokens (0–1). */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Grau em que os tokens do título menor estão contidos no maior (0–1).
 * Complementa o Jaccard: pega o caso "licenciamento de patentes" ⊂
 * "licenciamento de patentes de software" (Jaccard baixo, contenção alta).
 */
export function tokenContainment(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const [small, big] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let hits = 0;
  for (const t of small) if (big.has(t)) hits++;
  return hits / small.size;
}

/** Resultado da comparação de um título contra a lista de existentes. */
export interface DuplicateMatch {
  /** Título existente considerado duplicado. */
  title: string;
  /** Similaridade final usada na decisão (0–1). */
  score: number;
  /** `true` quando o slug é idêntico ao de um artigo já existente. */
  sameSlug: boolean;
}

/** Similaridade final entre dois títulos (máximo entre Jaccard e contenção). */
export function titleSimilarity(a: string, b: string): number {
  const tokensA = titleTokens(a);
  const tokensB = titleTokens(b);
  return Math.max(jaccardSimilarity(tokensA, tokensB), tokenContainment(tokensA, tokensB));
}

/**
 * Procura, entre `existingTitles`, o item mais parecido com `candidate`.
 * Devolve `null` quando nada ultrapassa o limite de similaridade.
 * Um slug idêntico é tratado como duplicidade independentemente do score.
 */
export function findDuplicateTitle(
  candidate: string,
  existingTitles: readonly string[],
  threshold: number = DEFAULT_SIMILARITY_THRESHOLD
): DuplicateMatch | null {
  const clean = String(candidate ?? "").trim();
  if (!clean || !existingTitles?.length) return null;

  const candidateSlug = slugify(clean);
  // Se o candidato é uma variação desambiguada ("... — Parte 2"), comparamos
  // como se fosse o tema base: assim ele não é marcado como duplicata do base
  // (é, por definição, o "novo ângulo" daquele tema). Mas ainda detectamos
  // colisão EXATA de slug com algum artigo realmente existente.
  const disambiguated = hasDisambiguator(clean);
  const candidateBase = disambiguated ? stripDisambiguator(clean) : clean;
  let best: DuplicateMatch | null = null;

  for (const raw of existingTitles) {
    const title = String(raw ?? "").trim();
    if (!title) continue;

    const sameSlug = slugify(title) === candidateSlug;
    const score = titleSimilarity(candidateBase, title);
    if (!sameSlug && score < threshold) continue;

    const effective = sameSlug ? 1 : score;
    // Um título desambiguado NÃO colide por similaridade com o tema base —
    // só colidiria se o slug final fosse idêntico ao de outro artigo.
    if (disambiguated && !sameSlug) continue;

    if (!best || effective > best.score) {
      best = { title, score: effective, sameSlug };
    }
  }

  return best;
}

/**
 * `true` quando o título (ou slug) já existe na lista informada.
 * Atalho booleano para os pontos em que só interessa saber se há colisão.
 */
export function isDuplicateTitle(
  candidate: string,
  existingTitles: readonly string[],
  threshold: number = DEFAULT_SIMILARITY_THRESHOLD
): boolean {
  return findDuplicateTitle(candidate, existingTitles, threshold) !== null;
}

/**
 * Torna um título único acrescentando um qualificador textual/numerado.
 * Usado APENAS como último recurso, quando a IA insiste em repetir o tema.
 * (ex.: "Licenciamento de Patentes" ⇒ "... — Parte 2")
 */
export function makeUniqueTitle(title: string, existingTitles: readonly string[]): string {
  const base = String(title ?? "").trim();
  const used = new Set(existingTitles.map((t) => slugify(String(t ?? ""))));
  const suffixes = ["Parte 2", "Parte 3", "Parte 4", "Abordagem prática", "Análise aprofundada"];

  for (const suffix of suffixes) {
    const candidate = `${base} — ${suffix}`;
    if (!used.has(slugify(candidate))) return candidate;
  }
  // Garante unicidade mesmo esgotando os sufixos fixos.
  let n = 2;
  while (used.has(slugify(`${base} — Parte ${n}`))) n++;
  return `${base} — Parte ${n}`;
}

/**
 * Lista enxuta (máx. `limit`) dos títulos existentes para enviar ao prompt da IA.
 * Mantém a ordem recebida (mais novos primeiro) e ignora vazios/duplicados,
 * evitando um prompt gigante.
 */
export function pickReferenceTitles(
  existingTitles: readonly string[],
  limit = 40
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of existingTitles) {
    const title = String(raw ?? "").trim();
    if (!title) continue;
    const key = slugify(title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
    if (out.length >= limit) break;
  }
  return out;
}

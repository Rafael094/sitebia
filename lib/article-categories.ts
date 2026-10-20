import { DEFAULT_ARTICLE_CATEGORIES } from "@/lib/constants";
import type { ArticleCategoryRecord } from "@/lib/types";

/**
 * Utilitários puros para categorias de conteúdo.
 * Não acessam o banco — podem ser usados no servidor e no cliente.
 */

const CONNECTORS = new Set([
  "a",
  "as",
  "com",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "para",
  "por"
]);

/** Transforma um slug em um rótulo legível (fallback quando o banco falha). */
export function humanizeCategorySlug(slug: string): string {
  const clean = String(slug ?? "").trim();
  if (!clean) return "Conteúdos";

  return clean
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && CONNECTORS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/** Ordena as categorias pelo campo `order_index` e, depois, pelo rótulo. */
export function sortArticleCategories(
  categories: ArticleCategoryRecord[]
): ArticleCategoryRecord[] {
  return [...categories].sort(
    (a, b) =>
      (a.order_index ?? 0) - (b.order_index ?? 0) ||
      a.label.localeCompare(b.label, "pt-BR")
  );
}

/** Rótulo de uma categoria pelo slug, com fallback legível. */
export function categoryLabelFor(
  slug: string,
  categories: ArticleCategoryRecord[] = DEFAULT_ARTICLE_CATEGORIES
): string {
  return categories.find((category) => category.slug === slug)?.label ?? humanizeCategorySlug(slug);
}

/** Mapa slug → categoria, útil para listas com muitos artigos. */
export function categoryMap(
  categories: ArticleCategoryRecord[]
): Map<string, ArticleCategoryRecord> {
  return new Map(categories.map((category) => [category.slug, category]));
}

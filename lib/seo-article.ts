// ============================================================================
// Automações de SEO dos artigos (usadas no Admin e no servidor de gravação).
// ============================================================================

import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { ArticleCategory } from "@/lib/types";

const STOPWORDS = new Set([
  "e","de","da","do","em","um","uma","que","com","por","para","os","as",
  "na","no","se","suas","sua","a","o","ao","dos","das","como","mais",
  "entre","voce","empresa","empresas","quem","sobre","quando","até","ja"
]);

/** Remove marcação Markdown leve e devolve texto simples (para descrição). */
export function stripMarkdown(src: string): string {
  return String(src ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^(#{1,6}\s*)/gm, "")
    .replace(/^[>*+\-\s\d.]+(?=\S)/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Gera a slug a partir do título (normalização em tempo real/equivalente). */
export { slugify };

/** Extrai uma lista única de keywords a partir do título + categoria. */
export function buildAutoTags(title: string, category: ArticleCategory): string[] {
  const words = stripMarkdown(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const tags = distinctAgainstStop(words).map(slugify);
  const catLabel = ARTICLE_CATEGORIES[category]?.label ?? "";
  const catTags = catLabel
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(slugify)
    .filter(Boolean);

  const merged: string[] = [];
  for (const t of [...tags, ...catTags]) {
    if (t && t.length > 1 && !merged.includes(t)) merged.push(t);
    if (merged.length >= 8) break;
  }
  return merged;
}

function distinctAgainstStop(words: string[]): string[] {
  return words.filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Define meta_description e tags de um artigo:
 *  - meta_description: valor informado ou primeiros ~160 chars do resumo/corpo;
 *  - tags: informadas (vírgula/linha) ou automáticas de título + categoria.
 */
export function resolveArticleSeo(input: {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  metaDescription?: string;
  tags?: string;
}): { metaDescription: string; tags: string[] } {
  const cleanSummary = stripMarkdown(input.summary);
  const cleanBody = stripMarkdown(input.content);

  const metaDescription =
    input.metaDescription && input.metaDescription.trim()
      ? input.metaDescription.trim()
      : (cleanSummary || cleanBody).replace(/\s+/g, " ").slice(0, 158);

  const providedTags = (input.tags ?? "")
    .split(/[,;|\n]/)
    .map((t) => slugify(t))
    .filter((t) => t.length > 1);

  const tags = providedTags.length
    ? providedTags.slice(0, 10)
    : buildAutoTags(input.title, input.category);

  return { metaDescription, tags };
}

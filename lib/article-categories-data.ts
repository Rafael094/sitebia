import { DEFAULT_ARTICLE_CATEGORIES } from "@/lib/constants";
import { sortArticleCategories } from "@/lib/article-categories";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ArticleCategoryRecord } from "@/lib/types";

/**
 * Leitura das categorias no SERVIDOR (painel).
 * Usa service_role para enxergar também as categorias inativas.
 */

export interface AdminCategoriesState {
  categories: ArticleCategoryRecord[];
  /** `false` enquanto a migração v10 não foi executada no Supabase. */
  available: boolean;
  error?: string;
}

export async function getAdminCategoriesState(): Promise<AdminCategoriesState> {
  try {
    const admin = getAdminSupabaseClient();
    const { data, error } = await admin
      .from("article_categories")
      .select("*")
      .order("order_index", { ascending: true })
      .order("label", { ascending: true });

    if (error) throw new Error(error.message);

    return {
      categories: sortArticleCategories((data ?? []) as ArticleCategoryRecord[]),
      available: true
    };
  } catch (error) {
    return {
      categories: DEFAULT_ARTICLE_CATEGORIES,
      available: false,
      error: error instanceof Error ? error.message : "Não foi possível carregar as categorias."
    };
  }
}

/** Categorias para formulários/editores (fallback nos padrões se necessário). */
export async function getAdminCategoriesSafe(): Promise<ArticleCategoryRecord[]> {
  return (await getAdminCategoriesState()).categories;
}

/**
 * Categorias utilizáveis em geração de conteúdo: prioriza as ativas; se nenhuma
 * estiver ativa, devolve todas; se a tabela ainda não existir, os padrões.
 */
export async function getAdminActiveCategoriesSafe(): Promise<ArticleCategoryRecord[]> {
  const { categories } = await getAdminCategoriesState();
  const active = categories.filter((category) => category.is_active);
  if (active.length) return active;
  if (categories.length) return categories;
  return DEFAULT_ARTICLE_CATEGORIES;
}

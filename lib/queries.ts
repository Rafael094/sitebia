import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Article, Service } from "@/lib/types";

/**
 * Camada de acesso a dados do SITE PÚBLICO.
 * Tudo aqui roda no servidor (Server Components), garantindo as políticas de RLS
 * via auth (cookies) e leitura somente dos ativos publicados.
 */

/** Retorna os N serviços ativos, ordenados pelo campão pedido. */
export const getActiveServices = cache(
  async (limit?: number): Promise<Service[]> => {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
);

/** Retorna um serviço ativo pelo slug. */
export const getServiceBySlug = cache(
  async (slug: string): Promise<Service | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
);

/** Busca os últimos N artigos PUBLICADOS. */
export const getPublishedArticles = cache(
  async (opts: { limit?: number; category?: string } = {}): Promise<Article[]> => {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (opts.category && opts.category !== "todos") {
      query = query.eq("category", opts.category);
    }
    if (opts.limit) query = query.limit(opts.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
);

/** Devolve o par de artigos anterior/próximo (baseado no atual) para navegação. */
export async function getAdjacentArticles(slug: string) {
  const supabase = await createSupabaseServerClient();
  const all = await getPublishedArticles({ limit: 100 });
  const index = all.findIndex((a) => a.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined
  };
}

/** Busca um artigo publicado pelo slug. */
export const getPublishedArticleBySlug = cache(
  async (slug: string): Promise<Article | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
);

/**
 * Gera o resumo de capa (tipicamente imagem) com fallback elegante quando o
 * artigo ainda não possui imagem de capa cadastrada.
 */
export function pickCover(article: Pick<Article, "title" | "cover_image_url">) {
  return article.cover_image_url;
}

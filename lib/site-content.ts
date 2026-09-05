import { cache } from "react";

import { PAGE_SECTION_KEYS } from "@/lib/page-content";
import type { PageContent } from "@/lib/types";

/*
 * Leitura (servidor, site público) dos conteúdos dinâmicos de seções.
 * Se o banco estiver vazio/indisponível, retorna lista vazia — cada consumidor
 * faz merge com o fallback (DEFAULT_PAGE_CONTENTS). Nunca quebra o site.
 */

type Row = Partial<PageContent> & { section_key: string };

/**
 * Retorna todas as linhas de page_contents existentes (chaves).
 * Não lança erro em caso de falha — os consumidores usam fallback.
 */
export const getAllPageContents = cache(async (): Promise<Row[]> => {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*");
    if (error) throw error;
    return (data ?? []) as Row[];
  } catch {
    return [];
  }
});

/** Mapa completo (key -> row salvo OU undefined) para componentes/hook. */
export const getSiteSectionMap = cache(
  async (): Promise<Record<string, Partial<PageContent>>> => {
    const rows = await getAllPageContents();
    const map: Record<string, Partial<PageContent>> = {};
    for (const k of PAGE_SECTION_KEYS) map[k] = {};
    for (const row of rows) {
      const { section_key: key, ...rest } = row;
      if (map[key]) map[key] = rest as Partial<PageContent>;
    }
    return map;
  }
);

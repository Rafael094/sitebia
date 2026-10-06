// ============================================================================
// SEO das páginas estáticas — leitura pública + ações do painel.
// ----------------------------------------------------------------------------
// Leitura: usada pelo `generateMetadata` das rotas ("/", "/atuacao", …).
// Escrita: usada pela área "/admin/seo" (formulário com o componente SeoFields).
//
// A tabela `page_seo` (migration v8) guarda o mesmo objeto SeoMetadata das
// demais tabelas de conteúdo.
// ============================================================================

"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { normalizeSeoMetadata, type SeoMetadata } from "@/lib/seo-types";
import { readSeoFromFormData } from "@/lib/seo-form";
import { resolveAutoSeo } from "@/server/seo-admin";
import {
  PAGE_SEO_KEYS,
  PAGE_SEO_REGISTRY,
  asPageSeoKey,
  type PageSeoKey
} from "@/lib/page-seo";

/**
 * Lê o SEO salvo de uma página (tolerante a falhas).
 * Retorna `{}` quando ainda não há registro — o fallback fica por conta do
 * `generateMetadata` da própria rota.
 */
export async function getPageSeo(pageKey: string): Promise<SeoMetadata> {
  try {
    const admin = getAdminSupabaseClient();
    const { data } = await admin
      .from("page_seo")
      .select("seo_metadata")
      .eq("page_key", pageKey)
      .maybeSingle();
    const row = data as { seo_metadata?: unknown } | null;
    return normalizeSeoMetadata(row?.seo_metadata);
  } catch {
    return {};
  }
}

/** Todas as páginas já com o SEO salvo mesclado (para a listagem do painel). */
export async function listPageSeo(): Promise<
  { key: PageSeoKey; seo: SeoMetadata }[]
> {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("page_seo")
    .select("page_key, seo_metadata");
  if (error) throw error;

  const map: Record<string, SeoMetadata> = {};
  for (const r of data ?? []) {
    const row = r as { page_key?: string; seo_metadata?: unknown };
    if (row.page_key) map[row.page_key] = normalizeSeoMetadata(row.seo_metadata);
  }

  return PAGE_SEO_KEYS.map((key) => ({ key, seo: map[key] ?? {} }));
}

export type PageSeoSaveResult = { ok: true } | { ok: false; error: string };

/**
 * Grava o SEO de uma página. Reaproveita a mesma leitura de campos do painel
 * (`seo_meta_title`, …) e o gatilho automático de IA quando nada foi informado.
 */
export async function savePageSeoAction(
  formData: FormData
): Promise<PageSeoSaveResult> {
  const keyRaw = (formData.get("page_key")?.toString() ?? "").trim();
  const key = asPageSeoKey(keyRaw);
  if (!key) return { ok: false, error: "Página inválida." };

  const meta = PAGE_SEO_REGISTRY[key];
  const manual = readSeoFromFormData(formData);

  let seo: SeoMetadata;
  if (manual.meta_title || manual.meta_description) {
    // Admin assumiu o controle — grava exatamente o que ele escreveu.
    seo = { ...manual, source: "manual" };
  } else {
    const current = await getPageSeo(key);
    if (current.meta_title && current.meta_description) {
      seo = current; // já otimizado — não mexe
    } else {
      const generated = await resolveAutoSeo({
        title: meta.defaultTitle,
        body: `${meta.defaultDescription}\n${meta.hint}`,
        kind: `Página do site (${key})`,
        context: key,
        current
      });
      seo = generated.seo;
    }
  }

  const admin = getAdminSupabaseClient();
  const { error } = await admin
    .from("page_seo")
    .upsert(
      [{ page_key: key, seo_metadata: seo } as never],
      { onConflict: "page_key" }
    );

  if (error) return { ok: false, error: error.message };

  // Revalida o site público para que o novo <head> seja servido.
  revalidatePath("/", "layout");
  return { ok: true };
}

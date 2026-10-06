// ============================================================================
// Leitura dos campos de SEO enviados pelos formulários do painel.
// Os nomes canônicos são seo_meta_title, seo_meta_description, … (ver SeoFields).
// ============================================================================

import { normalizeSeoMetadata, type SeoMetadata } from "@/lib/seo-types";

/**
 * Extrai o SeoMetadata de um FormData (nomes canônicos usados pelo painel).
 * Valores vazios NÃO entram no objeto — assim o merge no servidor mantém
 * o que já existia quando o admin não mexe no campo.
 */
export function readSeoFromFormData(formData: FormData): SeoMetadata {
  const get = (name: string) => (formData.get(name)?.toString() ?? "").trim();
  return normalizeSeoMetadata({
    meta_title: get("seo_meta_title"),
    meta_description: get("seo_meta_description"),
    meta_keywords: get("seo_meta_keywords"),
    og_title: get("seo_og_title"),
    og_description: get("seo_og_description"),
    og_image: get("seo_og_image"),
    source: get("seo_meta_title") || get("seo_meta_description") ? "manual" : undefined
  });
}

/** Indica se o formulário trouxe algum campo de SEO preenchido. */
export function hasSeoInput(formData: FormData): boolean {
  return ["seo_meta_title", "seo_meta_description", "seo_meta_keywords"].some(
    (k) => (formData.get(k)?.toString() ?? "").trim().length > 0
  );
}

// ============================================================================
// Monta o objeto `Metadata` do Next a partir do SEO de uma página.
// ----------------------------------------------------------------------------
// Uso: `export const generateMetadata = () => pageMetadata("/atuacao")`.
// Sempre preenche title/description (fallback do registry) e injeta o Open
// Graph — incluindo a imagem enviada pelo painel (upload em /admin/seo).
// ============================================================================

import type { Metadata } from "next";

import { SITE } from "@/lib/constants";
import { getPageSeo } from "@/server/page-seo-admin";
import { normalizeSeoMetadata } from "@/lib/seo-types";
import { PAGE_SEO_REGISTRY, type PageSeoKey } from "@/lib/page-seo";

/** Caminho relativo → absoluto (usa NEXT_PUBLIC_SITE_URL quando disponível). */
function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}

/**
 * Gera o `Metadata` de uma página estática.
 * @param key chave da página ("/", "/atuacao", …)
 */
export async function pageMetadata(key: PageSeoKey): Promise<Metadata> {
  const meta = PAGE_SEO_REGISTRY[key];
  const seo = await getPageSeo(key).catch(() => normalizeSeoMetadata(undefined));

  const title = seo.meta_title || meta.defaultTitle;
  // Home já traz a marca no título padrão; nas demais anexamos "| Bianca Martins".
  const fullTitle =
    key === "/" && title === SITE.title()
      ? title
      : title.endsWith(SITE.name)
        ? title
        : SITE.title(title);

  const description = seo.meta_description || meta.defaultDescription;
  const keywords =
    seo.meta_keywords || meta.defaultKeywords
      ? (seo.meta_keywords || meta.defaultKeywords)!.split(/,\s*/)
      : undefined;

  const ogTitle = seo.og_title || title;
  const ogDescription = seo.og_description || description;
  const ogImage = seo.og_image ? absoluteUrl(seo.og_image) : undefined;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical: absoluteUrl(meta.path) },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: meta.locale,
      url: absoluteUrl(meta.path),
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined
    }
  };
}


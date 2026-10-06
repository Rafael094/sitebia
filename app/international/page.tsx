import type { Metadata } from "next";

import IntlHero from "@/components/international/IntlHero";
import IntlTrustBar from "@/components/international/IntlTrustBar";
import IntlServices from "@/components/international/IntlServices";
import IntlIpProtection from "@/components/international/IntlIpProtection";
import IntlMarketEntry from "@/components/international/IntlMarketEntry";
import IntlInnovation from "@/components/international/IntlInnovation";
import IntlLawFirms from "@/components/international/IntlLawFirms";
import IntlWhy from "@/components/international/IntlWhy";
import IntlProcess from "@/components/international/IntlProcess";
import IntlAbout from "@/components/international/IntlAbout";
import IntlFaq from "@/components/international/IntlFaq";
import IntlFinalCta from "@/components/international/IntlFinalCta";
import IntlContactSection from "@/components/international/IntlContactSection";
import { PAGE_SECTION_KEYS } from "@/lib/page-content";
import { getSiteSectionMap } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE } from "@/lib/constants";
import { PAGE_SEO_REGISTRY } from "@/lib/page-seo";

const PAGE_URL = PAGE_SEO_REGISTRY["/international"].path;

// SEO editável pelo painel (/admin/seo) com fallback no padrão da página.
// Mantém o locale en_US e as palavras-chave voltadas ao mercado internacional.
export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata("/international");

export const dynamic = "force-dynamic";

/**
 * Landing page internacional — Bianca Martins:
 * "Innovation, Intellectual Property & Technology Transfer".
 *
 * O conteúdo textual de cada seção é editável pelo painel (/admin/secoes,
 * grupo "International"). A leitura de page_contents aqui serve apenas para
 * manter consistência com o restante do site; os componentes clientes já
 * consomem o conteúdo via SectionsProvider (useSectionContent).
 */
export default async function InternationalPage() {
  // Garante que os conteúdos das seções internacionais estejam registrados
  // no provider (mesma fonte usada pela Home e páginas internas).
  await getSiteSectionMap().catch(() => ({}));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${SITE.name} — International Clients`,
    description: PAGE_SEO_REGISTRY["/international"].defaultDescription,
    areaServed: "Brazil",
    serviceType: [
      "Intellectual Property",
      "Technology Transfer",
      "Brazil Market Entry",
      "Innovation Partnerships"
    ],
    availableLanguage: ["en", "pt"],
    url: PAGE_URL
  };

  // Sanity: as chaves internacionais devem estar registradas.
  const intlKeys = PAGE_SECTION_KEYS.filter((k) => k.startsWith("intl_"));
  if (intlKeys.length === 0) {
    // Nunca deve ocorrer; protege contra regressões de configuração.
    console.warn("[international] Nenhuma seção 'intl_*' registrada.");
  }

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD estático (dados controlados) — seguro para serialização.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <IntlHero />
      <IntlTrustBar />
      <IntlServices />
      <IntlIpProtection />
      <IntlMarketEntry />
      <IntlInnovation />
      <IntlLawFirms />
      <IntlWhy />
      <IntlProcess />
      <IntlAbout />
      <IntlFaq />
      <IntlContactSection />
      <IntlFinalCta />
    </>
  );
}

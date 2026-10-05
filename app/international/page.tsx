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
import { SITE } from "@/lib/constants";
import { PAGE_SECTION_KEYS } from "@/lib/page-content";
import { getSiteSectionMap } from "@/lib/site-content";

const PAGE_URL = "/international";

const TITLE =
  "International Clients | IP, Innovation & Technology Transfer in Brazil";
const DESCRIPTION =
  "Brazilian legal and strategic support for foreign companies and international law firms seeking intellectual property protection, market entry and innovation partnerships in Brazil.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "intellectual property Brazil",
    "trademark registration Brazil",
    "trademark lawyer Brazil",
    "patent protection Brazil",
    "Brazilian IP lawyer",
    "IP protection Brazil",
    "technology transfer Brazil",
    "innovation partnerships Brazil",
    "Brazil market entry",
    "Brazilian IP counsel"
  ],
  alternates: {
    canonical: PAGE_URL
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    locale: "en_US",
    siteName: SITE.name
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION
  }
};

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
    description: DESCRIPTION,
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

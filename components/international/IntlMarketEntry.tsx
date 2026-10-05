"use client";

import { Compass, FileSignature, ShieldCheck, type LucideIcon } from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const COLUMNS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "PROTECT",
    text: "Protect your trademarks, patents, software and other intellectual assets before entering the market."
  },
  {
    icon: FileSignature,
    title: "STRUCTURE",
    text: "Structure contracts, licensing arrangements, distribution relationships and technology transactions."
  },
  {
    icon: Compass,
    title: "NAVIGATE",
    text: "Coordinate Brazilian legal and regulatory requirements with specialized professionals when necessary."
  }
];

/** Seção de entrada no mercado brasileiro. Cabeçalho/CTA editáveis em intl_market_entry. */
export default function IntlMarketEntry() {
  const c = useSectionContent("intl_market_entry");

  return (
    <section
      id="market-entry"
      data-header-theme="light"
      className="scroll-mt-24 bg-ivory-100 py-20"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "BRAZIL MARKET ENTRY"}
          title={c.title || "Entering the Brazilian market?"}
          description={
            c.description ||
            "Brazil offers significant commercial and innovation opportunities, but navigating its legal, intellectual property and regulatory environment requires local expertise."
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.title} className="card p-6 lg:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-gold-500/15 text-gold-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-navy-900">
                  {col.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  {col.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <IntlCtaLink
            href={c.button_primary_url || "#contact"}
            variant="primary"
            dataAnalytics="intl_market_entry_cta"
          >
            {c.button_primary_label || "Discuss your Brazil market entry"}
          </IntlCtaLink>
        </div>
      </div>
    </section>
  );
}

"use client";

import { ArrowRight } from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const BLOCKS = [
  {
    id: "trademark-protection",
    title: "Trademark Protection",
    text: "Support for foreign companies seeking to protect and manage their trademarks before the Brazilian National Institute of Industrial Property (INPI).",
    items: [
      "Trademark searches",
      "Trademark applications",
      "Administrative proceedings",
      "Portfolio management",
      "Monitoring",
      "Renewals"
    ]
  },
  {
    id: "patent-protection",
    title: "Patent Protection",
    text: "Strategic and procedural support for companies seeking patent protection in Brazil, including coordination with specialized technical professionals when required.",
    items: [
      "Brazilian filing strategy",
      "Application coordination",
      "Procedural monitoring",
      "IP portfolio strategy",
      "Coordination with technical specialists"
    ]
  },
  {
    id: "other-ip",
    title: "Other Intellectual Property",
    text: "Broader intellectual property support connected to the protection and commercialization of intangible assets.",
    items: [
      "Software",
      "Industrial designs",
      "Copyright",
      "Licensing",
      "Assignment",
      "Technology agreements"
    ]
  }
];

/** Seção de Propriedade Intelectual. Cabeçalho/CTA editáveis em intl_ip. */
export default function IntlIpProtection() {
  const c = useSectionContent("intl_ip");

  return (
    <section
      id="ip-protection"
      data-header-theme="dark"
      className="scroll-mt-24 bg-navy-900 py-20 text-ivory-100"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "INTELLECTUAL PROPERTY"}
          title={c.title || "Protect your intellectual property in Brazil"}
          description={
            c.description ||
            "Brazil is one of the world's major markets. Protecting your brand, technology and other intellectual assets locally should be part of your market-entry strategy."
          }
          className="[&_h2]:text-white [&_p]:text-ivory-200/75"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {BLOCKS.map((b) => (
            <div
              key={b.id}
              id={b.id}
              className="scroll-mt-24 rounded-2xl border border-white/10 bg-navy-800/50 p-6 lg:p-8"
            >
              <h3 className="font-display text-xl font-semibold text-white">
                {b.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {b.text}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ivory-100/85">
                {b.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <IntlCtaLink
            href={c.button_primary_url || "#contact"}
            variant="gold"
            dataAnalytics="intl_ip_protect_cta"
          >
            {c.button_primary_label || "Protect your IP in Brazil"}
            <ArrowRight className="h-4 w-4" />
          </IntlCtaLink>
        </div>
      </div>
    </section>
  );
}

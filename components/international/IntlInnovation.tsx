"use client";

import {
  FlaskConical,
  GraduationCap,
  Network,
  Repeat,
  type LucideIcon
} from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const CARDS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: FlaskConical,
    title: "R&D Partnerships",
    text: "Structure collaborations involving companies, universities and research institutions."
  },
  {
    icon: Repeat,
    title: "Technology Transfer",
    text: "Support licensing, technology transfer and commercialization strategies."
  },
  {
    icon: GraduationCap,
    title: "University–Industry Partnerships",
    text: "Help companies navigate relationships with Brazilian universities and ICTs."
  },
  {
    icon: Network,
    title: "Innovation Ecosystems",
    text: "Strategic support for organizations developing innovation projects and partnerships."
  }
];

/** Seção de inovação e transferência de tecnologia. Cabeçalho/CTA editáveis em intl_innovation. */
export default function IntlInnovation() {
  const c = useSectionContent("intl_innovation");

  return (
    <section
      id="innovation"
      data-header-theme="dark"
      className="scroll-mt-24 bg-navy-800 py-20 text-ivory-100"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "INNOVATION & TECHNOLOGY TRANSFER"}
          title={c.title || "Build innovation partnerships in Brazil"}
          description={
            c.description ||
            "Brazil has a diverse innovation ecosystem connecting companies, universities, research institutions, startups and technology-based organizations. We support companies seeking to establish or structure these relationships."
          }
          className="[&_h2]:text-white [&_p]:text-ivory-200/75"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 transition-colors hover:border-gold-500/50"
              >
                <Icon className="h-7 w-7 text-gold-400" aria-hidden="true" />
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {card.text}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <IntlCtaLink
            href={c.button_primary_url || "#contact"}
            variant="gold"
            dataAnalytics="intl_innovation_cta"
          >
            {c.button_primary_label || "Discuss an innovation project"}
          </IntlCtaLink>
        </div>
      </div>
    </section>
  );
}

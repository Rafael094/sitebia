"use client";

import {
  Compass,
  Globe2,
  Layers,
  MapPin,
  type LucideIcon
} from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const PILLARS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MapPin,
    title: "LOCAL EXPERTISE",
    text: "Deep knowledge of the Brazilian legal and innovation environment."
  },
  {
    icon: Compass,
    title: "STRATEGIC APPROACH",
    text: "Legal protection is considered together with business, innovation and commercialization objectives."
  },
  {
    icon: Layers,
    title: "INTEGRATED PERSPECTIVE",
    text: "Intellectual property, contracts, innovation and technology transfer are treated as connected strategic elements."
  },
  {
    icon: Globe2,
    title: "CROSS-BORDER COMMUNICATION",
    text: "Clear communication designed for companies and professionals working across jurisdictions."
  }
];

/** Seção "Why Bianca" — quatro pilares. Cabeçalho editável em intl_why. */
export default function IntlWhy() {
  const c = useSectionContent("intl_why");

  return (
    <section data-header-theme="light" className="bg-ivory-100 py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "WHY BIANCA"}
          title={c.title || "Why work with Bianca?"}
          description={
            c.description ||
            "A single point of contact combining Brazilian legal expertise, business sense and cross-border communication."
          }
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex gap-5 rounded-md border border-navy-800/10 bg-white p-6 shadow-card sm:p-7"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-gold-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-navy-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    {p.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

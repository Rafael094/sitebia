"use client";

import { Landmark, Lightbulb, ShoppingBag } from "lucide-react";

import { useSectionContent } from "@/components/site/SectionsProvider";

const PILLARS = [
  {
    icon: Landmark,
    title: "INTELLECTUAL PROPERTY",
    text: "Protect and manage your IP in Brazil."
  },
  {
    icon: ShoppingBag,
    title: "BRAZIL MARKET ENTRY",
    text: "Navigate the Brazilian legal and regulatory landscape."
  },
  {
    icon: Lightbulb,
    title: "INNOVATION & TECHNOLOGY",
    text: "Build partnerships with companies, universities and research institutions."
  }
];

/**
 * Faixa de posicionamento (trust bar) logo após o hero.
 * Título/descrição editáveis em intl_trust; os três pilares são estruturais.
 */
export default function IntlTrustBar() {
  const c = useSectionContent("intl_trust");

  return (
    <section
      data-header-theme="light"
      className="border-b border-navy-800/10 bg-ivory-100 py-14"
    >
      <div className="container-site">
        <h2 className="sr-only">{c.title || "How we help"}</h2>

        <div className="grid gap-px overflow-hidden rounded-md border border-navy-800/10 bg-navy-800/10 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-ivory-100 p-6 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-navy-900 text-gold-400">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {c.description && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-navy-500">
            {c.description}
          </p>
        )}
      </div>
    </section>
  );
}

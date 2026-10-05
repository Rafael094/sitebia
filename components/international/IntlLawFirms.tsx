"use client";

import { ArrowRight, Check } from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import { useSectionContent } from "@/components/site/SectionsProvider";

const SERVICES = [
  "Brazilian trademark matters",
  "Patent matters",
  "IP portfolio management",
  "Trademark monitoring",
  "Administrative proceedings",
  "Technology agreements",
  "Technology transfer",
  "Local coordination"
];

/**
 * Seção de conversão para escritórios internacionais — fundo visualmente
 * distinto (navy profundo com faixa dourada). Conteúdo editável em intl_law_firms.
 */
export default function IntlLawFirms() {
  const c = useSectionContent("intl_law_firms");

  return (
    <section
      data-header-theme="dark"
      className="relative overflow-hidden bg-navy-950 py-20 text-ivory-100"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="container-site relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            {c.badge_text || "FOR INTERNATIONAL LAW FIRMS"}
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {c.title || "Looking for Brazilian IP support for your clients?"}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory-200/75">
            {c.description ||
              "We work with international law firms and intellectual property professionals that need reliable Brazilian support for their clients."}
          </p>

          {c.subtitle && (
            <p className="mt-6 font-display text-lg font-semibold text-gold-300">
              {c.subtitle}
            </p>
          )}

          <div className="mt-8">
            <IntlCtaLink
              href={c.button_primary_url || "#contact"}
              variant="gold"
              dataAnalytics="intl_law_firms_partnership_cta"
            >
              {c.button_primary_label || "Discuss a partnership"}
              <ArrowRight className="h-4 w-4" />
            </IntlCtaLink>
          </div>

          {c.quote_text && (
            <p className="mt-6 max-w-lg text-sm text-ivory-200/60">
              {c.quote_text}
            </p>
          )}
        </div>

        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2.5 border-b border-white/10 pb-3 text-sm text-ivory-100/90"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

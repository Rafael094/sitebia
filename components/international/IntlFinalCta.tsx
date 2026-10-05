"use client";

import { ArrowRight, MessageSquare } from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import { useSectionContent } from "@/components/site/SectionsProvider";

/** CTA final da landing internacional. Texto/botões editáveis em intl_cta. */
export default function IntlFinalCta() {
  const c = useSectionContent("intl_cta");

  return (
    <section data-header-theme="dark" className="py-16">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-md bg-navy-900 px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-navy-700 blur-2xl" />

          <p className="relative mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            {c.badge_text || "NEXT STEP"}
          </p>
          <h2 className="relative mx-auto max-w-2xl font-display text-2xl font-semibold text-white sm:text-3xl">
            {c.title || "Planning to enter or expand in Brazil?"}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-ivory-100/70">
            {c.description ||
              "Let's discuss your intellectual property, market-entry or innovation needs."}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <IntlCtaLink
              href={c.button_primary_url || "#contact"}
              variant="gold"
              dataAnalytics="intl_final_talk_to_bianca"
            >
              <MessageSquare className="h-4 w-4" />
              {c.button_primary_label || "Talk to Bianca"}
            </IntlCtaLink>
            <IntlCtaLink
              href={c.button_secondary_url || "#contact"}
              variant="ghost"
              dataAnalytics="intl_final_send_inquiry"
            >
              {c.button_secondary_label || "Send an inquiry"}
              <ArrowRight className="h-4 w-4" />
            </IntlCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

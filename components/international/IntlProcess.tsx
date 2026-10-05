"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const STEPS: { n: string; title: string; text: string }[] = [
  {
    n: "01",
    title: "UNDERSTAND",
    text: "We understand your business, technology, IP assets and objectives in Brazil."
  },
  {
    n: "02",
    title: "ASSESS",
    text: "We identify the relevant legal, IP, contractual and innovation considerations."
  },
  {
    n: "03",
    title: "STRUCTURE",
    text: "We develop a practical strategy and coordinate the necessary legal or technical work."
  },
  {
    n: "04",
    title: "EXECUTE",
    text: "We support implementation and maintain clear communication throughout the process."
  }
];

/** Seção "How we work" — processo em quatro etapas. Header editável em intl_process. */
export default function IntlProcess() {
  const c = useSectionContent("intl_process");

  return (
    <section data-header-theme="dark" className="bg-navy-900 py-20 text-ivory-100">
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "HOW WE WORK"}
          title={c.title || "A clear process for international clients"}
          description={
            c.description ||
            "A structured path from first conversation to implementation — you always know where you are and what comes next."
          }
          className="[&_h2]:text-white [&_p]:text-ivory-200/75"
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="relative">
              <article className="h-full rounded-2xl border border-white/10 bg-navy-800/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 lg:p-8">
                <span className="font-display text-3xl font-light text-gold-400/70">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wider text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {step.text}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

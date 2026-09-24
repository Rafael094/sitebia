"use client";

import {
  Boxes,
  FileCheck,
  FileSearch,
  Share2,
  type LucideIcon
} from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";
import { cn } from "@/lib/utils";

type JourneyStep = {
  n: string;
  title: string;
  text: string;
  icon: LucideIcon;
};

const STEPS: JourneyStep[] = [
  {
    n: "01",
    title: "Diagnóstico",
    text: "Auditoria do ativo: o que pode ser protegido, por qual via e com qual retorno.",
    icon: FileSearch
  },
  {
    n: "02",
    title: "Estruturação",
    text: "Portfólio organizado, titularidade definida e rotinas de gestão da PI.",
    icon: Boxes
  },
  {
    n: "03",
    title: "Conexão",
    text: "Pontes entre pesquisa e mercado: parceiros, spin-offs e inovação aberta.",
    icon: Share2
  },
  {
    n: "04",
    title: "Transferência",
    text: "Contratos e licenciamentos que destravam valor com segurança jurídica.",
    icon: FileCheck
  }
];

/** Etapa em destaque (borda dourada ativa + brilho interno). */
const FEATURED_STEP = "03";

/** Jornada — "Como posso ajudar": 4 etapas. Cabeçalho vem de page_contents (home_journey_header). */
export default function Journey() {
  const c = useSectionContent("home_journey_header");

  return (
    <section data-header-theme="dark" className="bg-navy-900 py-20 text-ivory-100">
      <div className="container-site">
        {/* Cabeçalho centralizado com moldura sutil */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow={c.badge_text || "COMO POSSO AJUDAR"}
            title={c.title || "Uma jornada clara, do ativo ao contrato"}
            className="mx-auto rounded-xl border border-white/10 bg-white/[0.03] px-6 py-8 [&_h2]:text-white sm:px-10"
          />
          <p className="mx-auto mb-16 mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            {c.description ||
              "Cada projeto passa por etapas estruturadas — você sabe exatamente em que ponto está e para onde vamos."}
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Linha conectora horizontal — alinhada ao centro vertical dos cartões */}
          {/* <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-gold-500/0 via-gold-500/50 to-gold-500/0 lg:block"
          /> */}

          {STEPS.map((step) => {
            const featured = step.n === FEATURED_STEP;
            const Icon = step.icon;

            return (
              <li key={step.n} className="relative">
                <article
                  className={cn(
                    "h-full rounded-2xl border border-white/10 bg-navy-800/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 lg:p-8",
                    featured &&
                      "border-amber-500/80 shadow-[0_0_20px_rgba(217,119,6,0.15)]"
                  )}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-display text-3xl font-light text-slate-400">
                      {step.n}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "h-6 w-6 text-gold-400",
                        featured && "text-amber-400"
                      )}
                    />
                  </div>

                  <h3
                    className={cn(
                      "font-display text-lg font-semibold uppercase tracking-wider text-white",
                      featured && "text-amber-400"
                    )}
                  >
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {step.text}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

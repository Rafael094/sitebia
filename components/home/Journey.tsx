import SectionHeading from "@/components/ui/SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Diagnóstico",
    text: "Auditoria do ativo: o que pode ser protegido, por qual via e com qual retorno."
  },
  {
    n: "02",
    title: "Estruturação",
    text: "Portfólio organizado, titularidade definida e rotinas de gestão da PI."
  },
  {
    n: "03",
    title: "Conexão",
    text: "Pontes entre pesquisa e mercado: parceiros, spin-offs e inovação aberta."
  },
  {
    n: "04",
    title: "Transferência",
    text: "Contratos e licenciamentos que destravam valor com segurança jurídica."
  }
];

/** Jornada — "Como posso ajudar": 4 etapas encadeadas. */
export default function Journey() {
  return (
    <section className="bg-navy-900 py-20 text-ivory-100">
      <div className="container-site">
        <SectionHeading
          eyebrow="Como posso ajudar"
          title="Uma jornada clara, do ativo ao contrato"
          description="Cada projeto passa por etapas estruturadas — você sabe exatamente em que ponto está e para onde vamos."
          className="[&_h2]:text-white [&_.text-navy-600]:text-ivory-200/70"
        />

        <ol className="relative mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* linha divisória */}
          <div className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-gold-500/0 via-gold-500/50 to-gold-500/0 lg:block" />

          {STEPS.map((step, i) => (
            <li key={step.n} className="relative flex gap-5 lg:block">
              <span className="relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-gold-500 bg-navy-900 font-display text-sm font-bold text-gold-400">
                {step.n}
              </span>
              <div className="mt-0 lg:mt-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-200/70">
                  {step.text}
                </p>
              </div>
              {/* seta entre etapas (desktop) */}
              {i < STEPS.length - 1 && (
                <span className="pointer-events-none absolute right-0 top-4 hidden text-gold-500 lg:inline">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import Image from "next/image";

/**
 * Seção "Sobre Mim" exibida logo após a Hero na Home.
 * Grid 2 colunas: texto (esquerda) e fotografia profissional (direita).
 */
export default function About() {
  return (
    <section
      id="sobre"
      aria-label="Sobre Bianca Martins"
      data-header-theme="dark"
      className="scroll-mt-24 bg-navy-900 py-20 text-ivory-100"
    >
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Coluna textual */}
        <div>
          <p className="section-eyebrow !text-gold-300">Sobre</p>

          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Quem está por trás
            <br />
            da ponte entre pesquisa e mercado
          </h2>

          <div className="mt-5 space-y-5 text-base leading-relaxed text-ivory-200/90">
            <p>
              Por muito tempo, minha atuação girou em torno de propriedade
              intelectual. Foi nesse caminho que percebi um problema maior:
              empresas que querem inovar em parceria com universidades esbarram
              em um processo para o qual raramente estão preparadas, que é
              negociar projetos, definir contrapartidas, entender prazos e
              cláusulas que não aparecem em um contrato comercial comum.
            </p>
            <p>
              Foi por isso que ampliei minha atuação. Hoje, ajudo empresas a
              estruturar e negociar projetos de transferência de tecnologia com
              universidades, do primeiro contato até a assinatura do contrato,
              para que a inovação não trave por falta de estrutura.
            </p>
            <p>
              Se a sua empresa está buscando ou já iniciou uma parceria com
              universidade para um projeto de inovação, aqui eu ajudo com
              conteúdos sobre esse tema.
            </p>
          </div>

          {/* Bloco de formação acadêmica */}
          <div className="mt-8 border-l-4 border-gold-500 bg-white p-6 shadow-card ring-1 ring-navy-800/5">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold-600">
              Formação acadêmica
            </h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <p className="font-semibold text-navy-900">
                  Universidade Estadual de Maringá (UEM)
                </p>
                <p className="mt-0.5 text-navy-600">
                  Mestre em Propriedade Intelectual, Transferência de Tecnologia
                  para Inovação, Sandbox regulatório e inovação no setor público
                  (2020 – 2024).{" "}
                  <span className="text-navy-700">
                    Apoio à elaboração de legislação e normas internas sobre
                    inovação.
                  </span>
                </p>
              </li>
              <li>
                <p className="font-semibold text-navy-900">
                  Universidade Estadual de Londrina (UEL)
                </p>
                <p className="mt-0.5 text-navy-600">
                  Graduada em Direito (2012 – 2017).
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Coluna da fotografia profissional */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          {/* Moldura elegante com folheado dourado */}
          <div className="absolute inset-0 -rotate-1 rounded-md border border-gold-500/40" />
          <div className="relative aspect-[4/5] w-full rotate-1 overflow-hidden rounded-md border border-gold-500/70 bg-navy-800 transition-transform duration-300 hover:rotate-0">
            <Image
              src="/images/bianca-martins.jpg"
              alt="Retrato profissional de Bianca Martins"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 90vw"
              className="object-cover object-top"
            />
            {/* Selo decorativo dourado no canto */}
            <span className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gold-500/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

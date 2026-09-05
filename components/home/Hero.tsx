"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, CalendarCheck } from "lucide-react";

/**
 * Hero da Home.
 * Para usar uma foto real, salve o arquivo em /public/images/bianca-profile.jpg.
 */
const PORTRAIT_PATH = "/images/bianca-profile.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory-100">
      {/* faixa decorativa fina no topo (dourado) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />

      <div className="container-site grid items-center gap-12 pt-32 pb-20 lg:grid-cols-2 lg:pt-36">
        {/* Coluna textual */}
        <div className="max-w-xl">
          <p className="section-eyebrow">Consultoria &amp; Assessoria Estratégica</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
            Transferência de Tecnologia e{" "}
            <span className="text-gold-600">Propriedade Intelectual</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-600">
            Transformo pesquisa e inovação em negócios seguros: do diagnóstico da
            proteção ao contrato que destrava valor entre universidades, empresas
            e pesquisadores.
          </p>

          {/* Linha de autoridade */}
          <blockquote className="mt-6 border-l-4 border-gold-500 pl-4 text-sm italic leading-relaxed text-navy-700">
            “Inovar sem proteger é construir sobre areia. Estruturo cada etapa para
            que a sua tecnologia gere valor — com segurança jurídica.”
          </blockquote>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/contato" className="btn-gold">
              <CalendarCheck className="h-4 w-4" /> Agendar diagnóstico
            </Link>
            <Link href="/atuacao" className="btn-ghost">
              Conhecer a atuação
            </Link>
          </div>
        </div>

        {/* Coluna visual */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-navy-800/5">
            <Image
              src={PORTRAIT_PATH || ""}
              alt="Retrato profissional de Bianca Martins"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
              onError={(e) => {
                // Fallback visual caso a foto ainda não exista (ex.: placeholder).
                const t = e.currentTarget;
                t.style.display = "none";
              }}
            />
            {/* Placeholder de moldura (visível apenas quando a imagem falha) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-700 to-navy-800">
              <span className="font-display text-7xl font-bold text-gold-400">
                BM
              </span>
              <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ivory-100/70">
                Bianca Martins
              </span>
            </div>
          </div>

          {/* Card de credibilidade sobreposto */}
          <div className="absolute -bottom-5 -left-3 rounded-md bg-navy-900 px-5 py-4 text-white shadow-xl sm:-left-8">
            <p className="font-display text-2xl font-bold text-gold-400">+10 anos</p>
            <p className="text-xs text-ivory-100/80">dedicados a PI &amp; inovação</p>
          </div>
        </div>
      </div>

      {/* indicador suave de rolagem */}
      <a
        href="#areas"
        className="hidden items-center gap-2 pb-8 text-xs font-medium uppercase tracking-widest text-navy-500 lg:inline-flex container-site"
      >
        <ArrowDown className="h-4 w-4 animate-bounce" /> Role para explorar
      </a>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, CalendarCheck } from "lucide-react";

import { useSectionContent } from "@/components/site/SectionsProvider";

/**
 * Hero da Home - conteúdo dinâmico vindo de page_contents (home_hero),
 * com fallback idêntico ao texto original. O visual é mantido.
 */
const PORTRAIT_PATH = "/images/bianca-martins.jpg";

/** Divide o marcador **...** para destaque dourado no título (H1). */
function splitTitle(raw: string) {
  const parts = (raw ?? "").split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return [raw];
  const nodes: (string | { text: string })[] = [];
  parts.forEach((p, i) => {
    if (!p) return;
    nodes.push(i % 2 === 1 ? { text: p } : p);
  });
  return nodes;
}

export default function Hero() {
  const c = useSectionContent("home_hero");
  const paragraph = [c.subtitle, c.description].filter(Boolean).join(" ");
  const quote = c.quote_text || "";
  const primary = c.button_primary_label || "Agendar diagnóstico";
  const primaryUrl = c.button_primary_url || "/contato";
  const secondary = c.button_secondary_label || "Conhecer a atuação";
  const secondaryUrl = c.button_secondary_url || "/atuacao";
  const imageSrc = c.image_url && c.image_url.trim() ? c.image_url : PORTRAIT_PATH;

  return (
    <section data-header-theme="light" className="relative overflow-hidden bg-ivory-100">
      {/* faixa decorativa fina no topo (dourado) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />

      <div className="container-site grid items-center gap-12 pb-20 pt-32 lg:grid-cols-2 lg:pt-36">
        {/* Coluna textual */}
        <div className="max-w-xl">
          <p className="section-eyebrow">{c.badge_text}</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {splitTitle(c.title || "").map((part, i) =>
              typeof part === "string" ? (
                part
              ) : (
                <span key={i} className="text-gold-600">
                  {part.text}
                </span>
              )
            )}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-600">{paragraph}</p>

          {quote ? (
            <blockquote className="mt-6 border-l-4 border-gold-500 pl-4 text-sm italic leading-relaxed text-navy-700">
              {quote}
            </blockquote>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={primaryUrl} className="btn-gold">
              <CalendarCheck className="h-4 w-4" /> {primary}
            </Link>
            <Link href={secondaryUrl} className="btn-ghost">
              {secondary}
            </Link>
          </div>
        </div>

        {/* Coluna visual */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-navy-800/5">
            <Image
              src={imageSrc}
              alt={c.badge_text ?? "Retrato profissional de Bianca Martins"}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
              }}
            />
            {/* Placeholder de moldura (visível apenas quando a imagem falha) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-700 to-navy-800">
              <span className="font-display text-7xl font-bold text-gold-400">BM</span>
              <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ivory-100/70">
                Bianca Martins
              </span>
            </div>
          </div>

          {/* Card de credibilidade sobreposto */}
          <div className="absolute -bottom-5 -left-3 rounded-md bg-navy-900 px-5 py-4 text-white shadow-xl sm:-left-8">
            <p className="font-display text-2xl font-bold text-gold-400">
              {c.badge_extra_title || "+10 ANOS"}
            </p>
            <p className="text-xs text-ivory-100/80">
              {c.badge_extra_sub || "dedicados a PI & inovação"}
            </p>
          </div>
        </div>
      </div>

      {/* indicador suave de rolagem */}
      <a
        href="#areas"
        className="container-site hidden items-center gap-2 pb-8 text-xs font-medium uppercase tracking-widest text-navy-500 lg:inline-flex"
      >
        <ArrowDown className="h-4 w-4 animate-bounce" /> Role para explorar
      </a>
    </section>
  );
}

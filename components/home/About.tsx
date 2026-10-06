"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useSectionContent } from "@/components/site/SectionsProvider";
import { sanitizeRichHtml } from "@/lib/rich-html";

/**
 * Seção "Sobre mim" exibida logo após a Hero na Home.
 * Grid 2 colunas: texto (esquerda) e fotografia profissional (direita).
 *
 * Todo o conteúdo é editável pelo painel em page_contents (home_about):
 * badge, título, descrição (texto rico), bloco de formação acadêmica e foto.
 */
const FALLBACK_IMAGE = "/images/bianca-martins.jpg";

/** Divide o título em linhas (\n) e marcadores **...** para destaque dourado. */
function renderTitle(raw: string) {
  const lines = (raw ?? "").split(/\r?\n/);
  return lines.map((line, li) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    const nodes: (string | { text: string })[] = [];
    parts.forEach((p, i) => {
      if (!p) return;
      nodes.push(i % 2 === 1 ? { text: p } : p);
    });
    return (
      <span key={li}>
        {nodes.map((part, i) =>
          typeof part === "string" ? (
            part
          ) : (
            <span key={i} className="text-gold-400">
              {part.text}
            </span>
          )
        )}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function About() {
  const c = useSectionContent("home_about");

  const imageSrc = c.image_url && c.image_url.trim() ? c.image_url : FALLBACK_IMAGE;
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);
  const showImage = Boolean(imageSrc) && !imageFailed;

  // Descrição e formação são gravadas como HTML rico pelo painel.
  // Sanitizamos novamente no cliente antes de renderizar (defesa em profundidade).
  const descriptionHtml = sanitizeRichHtml(c.description || "");
  const academicItemsHtml = sanitizeRichHtml(c.academic_items || "");
  const hasAcademic = Boolean(
    (c.academic_title && c.academic_title.trim()) || academicItemsHtml.trim()
  );

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
          <p className="section-eyebrow !text-gold-300">{c.badge_text || "SOBRE"}</p>

          {c.title && (
            <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {renderTitle(c.title)}
            </h2>
          )}

          {descriptionHtml && (
            <div
              className="prose-about mt-5"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}

          {/* Bloco de formação acadêmica */}
          {hasAcademic && (
            <div className="mt-8 border-l-4 border-gold-500 bg-white p-6 shadow-card ring-1 ring-navy-800/5">
              {c.academic_title && (
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold-600">
                  {c.academic_title}
                </h3>
              )}
              {academicItemsHtml && (
                <div
                  className="prose-about-box mt-4"
                  dangerouslySetInnerHTML={{ __html: academicItemsHtml }}
                />
              )}
            </div>
          )}
        </div>

        {/* Coluna da fotografia profissional */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          {/* Moldura elegante com folheado dourado */}
          <div className="absolute inset-0 -rotate-1 rounded-md border border-gold-500/40" />
          <div className="relative aspect-[4/5] w-full rotate-1 overflow-hidden rounded-md border border-gold-500/70 bg-navy-800 transition-transform duration-300 hover:rotate-0">
            {showImage ? (
              <Image
                src={imageSrc}
                alt="Retrato profissional de Bianca Martins"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 90vw"
                className="object-cover object-top"
                onError={() => setImageFailed(true)}
              />
            ) : (
              /* Placeholder de moldura (apenas sem imagem ou em caso de erro) */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-700 to-navy-800">
                <span className="font-display text-6xl font-bold text-gold-400">BM</span>
                <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ivory-100/70">
                  Bianca Martins
                </span>
              </div>
            )}
            {/* Selo decorativo dourado no canto */}
            <span className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gold-500/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

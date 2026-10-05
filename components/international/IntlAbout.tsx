"use client";

import Image from "next/image";

import { useSectionContent } from "@/components/site/SectionsProvider";

/**
 * Bloco "About" da landing internacional. Texto e foto editáveis em intl_about.
 * A descrição aceita texto simples (parágrafos separados por linha em branco).
 */
export default function IntlAbout() {
  const c = useSectionContent("intl_about");
  const hasImage = Boolean(c.image_url && c.image_url.trim());

  const paragraphs = (c.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="about"
      data-header-theme="light"
      className="scroll-mt-24 bg-ivory-100 py-20"
    >
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="section-eyebrow">{c.badge_text || "ABOUT"}</p>
          <h2 className="section-title">
            {c.title || "Brazilian expertise. International perspective."}
          </h2>

          <div className="mt-5 space-y-4 text-base leading-relaxed text-navy-700">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {hasImage && (
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute inset-0 -rotate-1 rounded-md border border-gold-500/40" />
            <div className="relative aspect-[4/5] w-full rotate-1 overflow-hidden rounded-md border border-gold-500/70 bg-navy-800 transition-transform duration-300 hover:rotate-0">
              <Image
                src={c.image_url as string}
                alt="Bianca Martins — Brazilian lawyer and consultant in IP, innovation and technology transfer"
                fill
                sizes="(min-width: 1024px) 42vw, 90vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

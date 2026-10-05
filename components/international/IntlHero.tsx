"use client";

import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";

import IntlCtaLink from "@/components/international/IntlCtaLink";
import { useSectionContent } from "@/components/site/SectionsProvider";

/**
 * Hero da landing internacional. Headline e subtítulo vêm de page_contents
 * (intl_hero) e são editáveis pelo painel. A imagem é opcional: quando
 * enviada, aparece como composição editorial ao lado do texto.
 */
export default function IntlHero() {
  const c = useSectionContent("intl_hero");
  const hasImage = Boolean(c.image_url && c.image_url.trim());

  // Headline quebra em três linhas quando cada frase existe.
  const lines = [
    "Protect your IP.",
    "Enter the Brazilian market.",
    "Build innovation partnerships."
  ];
  const headlineLines =
    c.title && c.title.trim()
      ? c.title
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      : lines;

  return (
    <section
      data-header-theme="dark"
      className="relative overflow-hidden bg-navy-900 pt-32 text-ivory-100 sm:pt-36"
    >
      {/* Brilhos decorativos discretos */}
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-navy-700 blur-2xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="container-site relative pb-20">
        <div
          className={
            hasImage
              ? "grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
              : "max-w-3xl"
          }
        >
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-gold-400">
              {c.badge_text || "INTERNATIONAL CLIENTS"}
            </p>

            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {c.subtitle && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory-200/75 sm:text-lg">
                {c.subtitle}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <IntlCtaLink
                href={c.button_primary_url || "#contact"}
                variant="gold"
                dataAnalytics="intl_hero_talk_to_bianca"
              >
                <MessageSquare className="h-4 w-4" />
                {c.button_primary_label || "Talk to Bianca"}
              </IntlCtaLink>
              <IntlCtaLink
                href={c.button_secondary_url || "#services"}
                variant="ghost"
                dataAnalytics="intl_hero_explore_services"
              >
                {c.button_secondary_label || "Explore our services"}
                <ArrowRight className="h-4 w-4" />
              </IntlCtaLink>
            </div>

            {c.quote_text && (
              <p className="mt-8 inline-flex items-center gap-3 text-sm text-ivory-200/60">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-gold-500/60"
                />
                {c.quote_text}
              </p>
            )}
          </div>

          {hasImage && (
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute inset-0 -rotate-1 rounded-md border border-gold-500/30" />
              <div className="relative aspect-[4/5] w-full rotate-1 overflow-hidden rounded-md border border-gold-500/60 bg-navy-800 transition-transform duration-300 hover:rotate-0">
                <Image
                  src={c.image_url as string}
                  alt="Bianca Martins — Innovation, Intellectual Property and Technology Transfer"
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 90vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

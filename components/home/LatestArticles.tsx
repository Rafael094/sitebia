import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import ArticleCard from "@/components/ui/ArticleCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/lib/types";

/**
 * Últimos conteúdos — Estilo Banner Imersivo em Destaque (Opção 3):
 * o artigo mais recente ocupa um banner horizontal grande no topo (capa com
 * overlay escuro, categoria, título, data e CTA integrados) e os artigos
 * seguintes aparecem em uma grade simétrica de cards logo abaixo.
 */
export default function LatestArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const featured = articles[0];
  const rest = articles.slice(1, 4);

  const featuredCategory = ARTICLE_CATEGORIES[featured.category];
  const hasCover = Boolean(featured.cover_image_url);

  return (
    <section data-header-theme="light" className="bg-ivory-100 py-20">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Últimos conteúdos"
            title="Artigos, análises e notas técnicas"
          />
          <Link
            href="/conteudos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-gold-600"
          >
            Ver todos os conteúdos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Banner imersivo — artigo em destaque (o mais recente). */}
        <Link
          href={`/conteudos/${featured.slug}`}
          className="group relative mt-12 block overflow-hidden rounded-md bg-navy-900 shadow-card ring-1 ring-navy-800/10"
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
            {hasCover ? (
              <Image
                src={featured.cover_image_url}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-gold-500/60">
                <span className="font-display text-6xl font-bold text-gold-400/80">
                  BM
                </span>
              </div>
            )}

            {/* Overlay escuro elegante para legibilidade. */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-900/55 to-navy-900/10" />

            {/* Conteúdo integrado na base do banner. */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center rounded-sm bg-gold-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-900 shadow-sm">
                {featuredCategory.label}
              </span>
              <h3 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-ivory-100 transition-colors group-hover:text-gold-300 sm:text-3xl lg:text-4xl">
                {featured.title}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ivory-100/80 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-gold-400" />
                  {formatDate(featured.created_at)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-gold-300">
                  Ler artigo{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Cards secundários — próximos artigos em grade simétrica. */}
        {rest.length > 0 && (
          <div className="mt-6 grid items-stretch gap-6 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

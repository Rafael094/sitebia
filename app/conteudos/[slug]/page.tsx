import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from "lucide-react";

import RichText from "@/components/ui/RichText";
import CtaBanner from "@/components/ui/CtaBanner";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { getAdjacentArticles, getPublishedArticleBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const category = ARTICLE_CATEGORIES[article.category];
  const { prev, next } = await getAdjacentArticles(slug).catch(() => ({
    prev: undefined,
    next: undefined
  }));
  const hasCover = Boolean(article.cover_image_url);

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-ivory-100 pt-28">
        <div className="container-site flex flex-wrap items-center justify-between gap-3 border-b border-navy-800/10 pb-5">
          <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-navy-500">
            <Link href="/" className="hover:text-navy-800">Início</Link>
            <span>/</span>
            <Link href="/conteudos" className="hover:text-navy-800">Conteúdos</Link>
            <span>/</span>
            <span className="text-gold-600">{article.title}</span>
          </p>
          <Link
            href="/conteudos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-navy-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para conteúdos
          </Link>
        </div>
      </section>

      <article className="bg-ivory-100">
        <div className="container-site max-w-4xl pt-10">
          <p className="section-eyebrow">{category.label}</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
            {article.title}
          </h1>

          {/* Metadados */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-gold-600" /> {article.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold-600" /> {formatDate(article.created_at)}
            </span>
          </div>

          <p className="mt-6 border-l-4 border-gold-500 pl-4 text-lg italic leading-relaxed text-navy-700">
            {article.summary}
          </p>

          {/* Capa */}
          {hasCover ? (
            <div className="relative mt-8 aspect-[16/7] w-full overflow-hidden rounded-md bg-navy-800">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1060px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto mt-8 flex aspect-[16/7] w-full max-w-2xl items-center justify-center rounded-md bg-gradient-to-br from-navy-800 to-navy-700">
              <span className="font-display text-4xl font-bold text-gold-400">BM</span>
            </div>
          )}

          <div className="mt-10 max-w-3xl">
            <RichText content={article.content} />
          </div>
        </div>

        {/* Navegação anterior/próxima */}
        <div className="container-site max-w-4xl pt-12">
          <div className="grid gap-4 border-t border-navy-800/10 pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/conteudos/${prev.slug}`}
                className="card group p-5 hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                  ← Anterior
                </p>
                <p className="mt-2 font-display text-sm font-semibold text-navy-800 group-hover:text-navy-700">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/conteudos/${next.slug}`}
                className="card group p-5 text-right hover:-translate-y-0.5"
              >
                <p className="flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-widest text-gold-600">
                  Próximo <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="mt-2 font-display text-sm font-semibold text-navy-800 group-hover:text-navy-700">
                  {next.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </article>

      <CtaBanner />
    </>
  );
}

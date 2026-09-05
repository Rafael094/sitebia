import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ArticleCard from "@/components/ui/ArticleCard";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Article } from "@/lib/types";

/** Últimos conteúdos — os 3 artigos publicados mais recentes. */
export default function LatestArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="bg-ivory-100 py-20">
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

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Destaque da primeira notícia ocupa 2 colunas */}
          {featured && (
            <ArticleCard
              article={featured}
              priority
              className="md:col-span-2 md:row-span-2"
            />
          )}
          {rest.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

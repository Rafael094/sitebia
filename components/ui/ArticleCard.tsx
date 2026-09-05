import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/lib/types";

type Props = {
  article: Pick<
    Article,
    "slug" | "title" | "summary" | "cover_image_url" | "category" | "created_at"
  >;
  priority?: boolean;
  className?: string;
};

/** Card de artigo com capa (imagem do Supabase Storage ou placeholder). */
export default function ArticleCard({ article, priority, className = "" }: Props) {
  const category = ARTICLE_CATEGORIES[article.category];
  const hasCover = Boolean(article.cover_image_url);

  return (
    <Link
      href={`/conteudos/${article.slug}`}
      className={`card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {/* Capa */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-800">
        {hasCover ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-gold-500/60">
            {/* Monograma tipográfico como fallback */}
            <span className="font-display text-5xl font-bold text-gold-400/80">
              BM
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-sm bg-ivory-100/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
          {category.label}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 text-xs text-navy-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(article.created_at)}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-navy-900 group-hover:text-navy-700">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-600">
          {article.summary}
        </p>
        <span className="mt-auto pt-4 text-sm font-semibold text-gold-600">
          Ler artigo →
        </span>
      </div>
    </Link>
  );
}

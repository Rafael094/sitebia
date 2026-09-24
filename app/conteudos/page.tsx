import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import PageHero from "@/components/ui/PageHero";
import ArticleCard from "@/components/ui/ArticleCard";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { getPublishedArticles } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  // A marca é acrescentada pelo template do layout raiz — não repetir aqui.
  title: "Conteúdos",
  description:
    "Artigos, análises e notas sobre transferência de tecnologia, propriedade intelectual e contratos & parcerias."
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ categoria?: string }>;
}

/** Filtro por categoria — usado para gerar os botões/tabs. */
const CATEGORY_FILTERS = [
  { value: "todos", label: "Todos" },
  ...Object.entries(ARTICLE_CATEGORIES).map(([value, { label }]) => ({
    value,
    label
  }))
];

export default async function ConteudosPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const current = categoria ?? "todos";

  const articles = await getPublishedArticles({
    category: current
  }).catch(() => []);

  return (
    <>
      <PageHero
        eyebrow="Conteúdos"
        title="Reflexões, análises e notas técnicas"
        description="Conteúdo relevante para quem inova, protege e transfere tecnologia — produzido por quem vive esse mercado todos os dias."
        icon={Newspaper}
      />

      <section className="bg-ivory-100 py-14">
        <div className="container-site">
          {/* Tabs de filtro por categoria */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((f) => {
              const active = current === f.value;
              const params = new URLSearchParams();
              if (f.value !== "todos") params.set("categoria", f.value);
              const href = params.toString() ? `/conteudos?${params.toString()}` : "/conteudos";
              return (
                <a
                  key={f.value}
                  href={href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-navy-800/15 bg-white text-navy-700 hover:border-navy-800/40"
                  )}
                >
                  {f.label}
                </a>
              );
            })}
          </div>

          {/* Grade de artigos */}
          {articles.length === 0 ? (
            <p className="mt-14 rounded-md border border-navy-800/10 bg-white p-8 text-center text-sm text-navy-500">
              Nenhum conteúdo publicado nesta categoria ainda. Volte em breve.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";

import ArticleCategoriesManager from "@/components/admin/ArticleCategoriesManager";
import { getAdminCategoriesState } from "@/lib/article-categories-data";
import { listAdminArticles } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Categorias de Conteúdo",
  robots: { index: false }
};
export const dynamic = "force-dynamic";

export default async function AdminArticleCategoriesPage() {
  const [{ categories, available, error }, articles] = await Promise.all([
    getAdminCategoriesState(),
    listAdminArticles().catch(() => [])
  ]);

  const counts = articles.reduce<Record<string, number>>((acc, article) => {
    acc[article.category] = (acc[article.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Categorias de conteúdo
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Crie, renomeie, reordene e ative/desative as categorias usadas nos
          artigos e no filtro público de /conteudos.
        </p>
      </div>

      <div className="card p-5">
        <ArticleCategoriesManager
          categories={categories}
          counts={counts}
          available={available}
          loadError={error}
        />
      </div>
    </div>
  );
}

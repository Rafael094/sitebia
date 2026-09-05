import type { Metadata } from "next";

import { getAdminArticle } from "@/server/admin-data";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Editar Conteúdo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditarConteudoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getAdminArticle(id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Editar conteúdo</h1>
        <p className="mt-1 text-sm text-navy-500">Salve as alterações para republicar no site.</p>
      </div>
      {article ? (
        <div className="card p-6">
          <ArticleForm article={article} isEditing />
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-navy-500">
          Conteúdo não encontrado. Verifique o link.
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";

import ArticleForm from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Novo Conteúdo", robots: { index: false } };

export default function NovoConteudoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Novo conteúdo</h1>
        <p className="mt-1 text-sm text-navy-500">
          Redija o artigo. Você poderá salvar como rascunho ou publicar direto.
        </p>
      </div>
      <div className="card p-6">
        <ArticleForm />
      </div>
    </div>
  );
}

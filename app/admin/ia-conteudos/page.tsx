import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import AiArticleGenerator from "@/components/admin/AiArticleGenerator";

export const metadata: Metadata = {
  title: "IA & Conteúdos",
  robots: { index: false }
};

export default function AdminIaConteudosPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Geração de Conteúdo e SEO com IA
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">
            Crie artigos completos sobre Propriedade Intelectual, patentes, inovação e
            transferência de tecnologia. A IA define o tema, redige o texto estruturado,
            otimiza o SEO e gera a imagem de capa — tudo editável antes de publicar.
          </p>
        </div>
        <Link href="/admin/conteudos" className="btn-ghost inline-flex items-center gap-1.5 text-sm">
          <FileText className="h-4 w-4" /> Ver conteúdos
        </Link>
      </div>

      <AiArticleGenerator />
    </div>
  );
}

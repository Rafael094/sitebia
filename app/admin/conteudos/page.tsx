import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FileText, Pencil } from "lucide-react";

import { listAdminArticles } from "@/server/admin-data";
import { ARTICLE_CATEGORY_LIST } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";

export const metadata: Metadata = { title: "Conteúdos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminConteudosPage() {
  const articles = await listAdminArticles().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Conteúdos</h1>
          <p className="mt-1 text-sm text-navy-500">Artigos técnicos e institucionais do blog /conteudos.</p>
        </div>
        <Link href="/admin/conteudos/novo" className="btn-primary">+ Novo conteúdo</Link>
      </div>

      {articles.length === 0 ? (
        <div className="card p-10 text-center text-sm text-navy-500">Nenhum conteúdo cadastrado ainda.</div>
      ) : (
        <div className="overflow-hidden rounded-md border border-navy-800/10 bg-white">
          <ul className="divide-y divide-navy-800/10">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-ivory-50">
                {a.cover_image_url ? (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-navy-800/10 bg-navy-800/5">
                    <Image src={a.cover_image_url} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-sm bg-navy-800/5 text-navy-300">
                    <FileText className="h-6 w-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                        a.is_published ? "bg-navy-800/10 text-navy-700" : "bg-gold-500/20 text-gold-700"
                      )}
                    >
                      {a.is_published ? "Publicado" : "Rascunho"}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-navy-400">
                      {
                        ARTICLE_CATEGORY_LIST.find((c) => c.value === a.category)?.label ??
                        a.category
                      }
                    </span>
                  </div>
                  <Link href={`/admin/conteudos/${a.id}/editar`} className="mt-1 block font-medium text-navy-900 hover:text-navy-700">
                    {a.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-navy-400">
                    {a.author} · {formatDate(a.created_at)} · /conteudos/
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/conteudos/${a.id}/editar`}
                    title="Editar"
                    className="rounded-sm border border-navy-800/15 p-2 text-navy-700 hover:bg-navy-800 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteArticleButton id={a.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

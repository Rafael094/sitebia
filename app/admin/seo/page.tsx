import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Globe, Plus } from "lucide-react";

import { listPageSeo } from "@/server/page-seo-admin";
import { PAGE_SEO_REGISTRY } from "@/lib/page-seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SEO das páginas",
  robots: { index: false }
};

export default async function AdminSeoPage() {
  const pages = await listPageSeo().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            SEO das páginas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">
            Edite o título, a descrição, as palavras-chave e a imagem de
            compartilhamento (Open Graph) do <code>&lt;head&gt;</code> de cada
            página do site. Use o botão <strong>Gerar com IA</strong> para uma
            sugestão automática e o <strong>upload</strong> para a imagem de redes
            sociais.
          </p>
        </div>
        <Link href="/admin" className="btn-ghost">
          <Plus className="h-4 w-4" /> Painel
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-500">
          <Globe className="h-4 w-4 text-gold-600" /> Páginas do site
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {pages.map(({ key, seo }) => {
            const meta = PAGE_SEO_REGISTRY[key];
            const preview =
              seo.meta_description ||
              seo.meta_title ||
              meta.defaultDescription ||
              "";
            const configured = Boolean(seo.meta_title || seo.meta_description);
            return (
              <Link
                key={key}
                href={`/admin/seo/${meta.slug}`}
                className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-gold-500/15 text-gold-700">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="block font-display text-base font-semibold text-navy-900 group-hover:text-gold-700">
                      {meta.label}
                    </span>
                    <code className="rounded-sm bg-ivory-100 px-1.5 py-0.5 text-[10px] text-navy-500">
                      {meta.path}
                    </code>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-navy-500">
                    {preview}
                  </span>
                  <span
                    className={`mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide ${
                      configured ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {configured ? "SEO configurado" : "Usando o padrão"}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-navy-300 group-hover:text-gold-600" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Layers, Plus, SquarePen } from "lucide-react";

import { listAdminSections } from "@/server/site-sections-admin";
import { SECTION_META } from "@/lib/page-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Seções do site",
  robots: { index: false }
};

/** Agrupa seções (Home / Páginas internas / Geral). */
const GROUPS = ["Home", "Páginas internas", "Geral"];

export default async function AdminSecoesPage() {
  const sections = await listAdminSections().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Seções do site
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">
            Edite os textos institucionais que alimentam a Home e as páginas
            internas. Cada seção preserva o visual atual (cores, espaçamentos e
            tipografia) e aceita texto rico em descrições e citações.
          </p>
        </div>
        <Link href="/admin" className="btn-ghost">
          <Plus className="h-4 w-4" /> Painel
        </Link>
      </div>

      {sections.length === 0 ? (
        <div className="card p-10 text-center text-sm text-navy-500">
          Nenhuma seção disponível. Execute o seed em <code>supabase/schema.sql</code>.
        </div>
      ) : (
        GROUPS.map((group) => {
          const grouped = sections.filter(
            (s) => SECTION_META[s.key]?.group === group
          );
          if (!grouped.length) return null;
          return (
            <section key={group} className="space-y-3">
              <h2 className="flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-500">
                <Layers className="h-4 w-4 text-gold-600" /> {group}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {grouped.map(({ key, content }) => {
                  const meta = SECTION_META[key];
                  const preview =
                    content.description || content.subtitle || content.title || "";
                  return (
                    <Link
                      key={key}
                      href={`/admin/secoes/${key}`}
                      className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-gold-500/15 text-gold-700">
                        <SquarePen className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-base font-semibold text-navy-900 group-hover:text-gold-700">
                          {meta?.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-navy-500">
                          {preview}
                        </span>
                        <code className="mt-1 inline-block text-[10px] text-navy-400">
                          {key}
                        </code>
                      </span>
                      <ChevronRight className="h-5 w-5 text-navy-300 group-hover:text-gold-600" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

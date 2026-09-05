import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from "lucide-react";

import { listAdminServices } from "@/server/admin-data";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import DeleteServiceButton from "@/components/admin/DeleteServiceButton";

export const metadata: Metadata = { title: "Serviços", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminServicosPage() {
  const services = await listAdminServices().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Serviços</h1>
          <p className="mt-1 text-sm text-navy-500">Gerencie os serviços exibidos na área de atuação.</p>
        </div>
        <Link href="/admin/servicos/novo" className="btn-primary">+ Novo serviço</Link>
      </div>

      {services.length === 0 ? (
        <div className="card p-10 text-center text-sm text-navy-500">
          Nenhum serviço cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-navy-800/10 bg-white">
          <ul className="divide-y divide-navy-800/10">
            {services.map((s, idx) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ivory-50">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-gold-500/15 text-[11px] font-bold text-gold-700">
                      {idx + 1}
                    </span>
                    <Link href={`/admin/servicos/${s.id}/editar`} className="font-medium text-navy-900 hover:text-navy-700">
                      {s.title}
                    </Link>
                    <span className="truncate rounded-sm bg-navy-800/5 px-2 py-0.5 font-mono text-[11px] text-navy-500">
                      /atuacao/{slugify(s.slug || s.title)}
                    </span>
                  </div>
                  {s.summary && (
                    <p className="mt-1 line-clamp-1 pl-7 text-sm text-navy-500">{s.summary}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase",
                      s.is_active ? "bg-navy-800/10 text-navy-700" : "bg-navy-800/5 text-navy-400"
                    )}
                  >
                    {s.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </span>
                  <Link
                    href={`/admin/servicos/${s.id}/editar`}
                    title="Editar"
                    className="rounded-sm border border-navy-800/15 p-2 text-navy-700 hover:bg-navy-800 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteServiceButton id={s.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-navy-400">
        <ArrowDown className="h-4 w-4" /> A ordem de exibição usa o campo
        <ArrowUp className="h-4 w-4" /> “Ordem” definido em cada card.
      </p>
    </div>
  );
}

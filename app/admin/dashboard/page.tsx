import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  BarChart3,
  FileText,
  Inbox,
  MessageSquare,
  TrendingUp
} from "lucide-react";

import { getDashboardMetrics } from "@/server/admin-data";
import { formatDate, cn } from "@/lib/utils";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false }
};
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser().catch(() => null);
  const m = await getDashboardMetrics().catch(() => null);

  if (!user) {
    return <div className="card p-8 text-sm text-navy-600">Sessão não identificada. Redirecionando…</div>;
  }
  if (!m) {
    return (
      <div className="card p-8 text-sm text-navy-600">
        Não foi possível carregar as métricas. Verifique as variáveis do Supabase e se o schema foi aplicado.
      </div>
    );
  }

  const stats = [
    { label: "Artigos publicados", value: m.publishedCount, sub: `${m.draftsCount} rascunho(s)`, icon: FileText },
    { label: "Serviços ativos", value: m.servicesCount, sub: "registrados", icon: Archive },
    { label: "Mensagens recebidas", value: m.messagesCount, sub: `${m.unreadCount} não lida(s)`, icon: Inbox },
    { label: "Total de artigos", value: m.articlesCount, sub: "no banco", icon: BarChart3 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">Visão geral do conteúdo e dos recados de contato.</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-gold-500/15 text-gold-600">
                <s.icon className="h-5 w-5" />
              </span>
              <TrendingUp className="h-4 w-4 text-navy-300" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-navy-900">{s.value}</p>
            <p className="text-sm font-medium text-navy-600">{s.label}</p>
            <p className="text-xs text-navy-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/servicos/novo" className="btn-primary">+ Novo serviço</Link>
        <Link href="/admin/conteudos/novo" className="btn-gold">+ Novo conteúdo</Link>
        <Link href="/admin/mensagens" className="btn-ghost">Ver mensagens</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mensagens recentes */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <Inbox className="h-5 w-5 text-gold-600" /> Mensagens recentes
          </h2>
          {m.latestMessages.length === 0 ? (
            <p className="mt-4 text-sm text-navy-500">Nenhuma mensagem ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-navy-800/5">
              {m.latestMessages.map((msg) => (
                <li key={msg.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                      <MessageSquare className="h-4 w-4 text-gold-600" />
                      {msg.name}
                      {!msg.is_read && (
                        <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-700">
                          nova
                        </span>
                      )}
                    </p>
                    <span className="whitespace-nowrap text-xs text-navy-400">
                      {formatDate(msg.created_at, false)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-navy-500">{msg.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Artigos recentes */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <FileText className="h-5 w-5 text-gold-600" /> Conteúdos recentes
          </h2>
          {m.latestArticles.length === 0 ? (
            <p className="mt-4 text-sm text-navy-500">Nenhum conteúdo ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-navy-800/5">
              {m.latestArticles.map((a) => (
                <li key={a.id} className="py-3">
                  <Link href={`/admin/conteudos/${a.id}/editar`} className="group">
                    <p className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-navy-800 group-hover:text-navy-700">
                        {a.title}
                      </span>
                      <span
                        className={cn(
                          "whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          a.is_published ? "bg-navy-800/10 text-navy-700" : "bg-gold-500/20 text-gold-700"
                        )}
                      >
                        {a.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-navy-400">
                      {ARTICLE_CATEGORIES[a.category].label} · {formatDate(a.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}


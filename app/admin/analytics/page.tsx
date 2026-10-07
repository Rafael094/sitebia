import type { Metadata } from "next";
import { Eye, Users, CalendarDays, TrendingUp, BarChart3, PieChart } from "lucide-react";

import {
  getAnalyticsOverview,
  CONTENT_TYPE_LABELS
} from "@/server/analytics-data";
import {
  DailyViewsChart,
  TopContentBarChart,
  ContentTypePieChart
} from "@/components/admin/AnalyticsCharts";

export const metadata: Metadata = {
  title: "Analytics & BI",
  robots: { index: false }
};
export const dynamic = "force-dynamic";

/** Formata números no padrão pt-BR (ex.: 1.234). */
const nf = new Intl.NumberFormat("pt-BR");

/**
 * Analytics & BI — painel de métricas de uso do site.
 * Cards de resumo + gráficos interativos (linha, barras e pizza),
 * todos rotulados em português do Brasil.
 */
export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsOverview().catch(() => null);

  const cards = data
    ? [
        { label: "Acessos hoje", value: data.todayTotal, icon: Eye, sub: "desde 00:00" },
        { label: "Acessos no mês", value: data.monthTotal, icon: CalendarDays, sub: "mês corrente" },
        { label: "Visitantes únicos", value: data.uniqueVisitors, icon: Users, sub: "últimos 30 dias" },
        { label: "Acessos totais", value: data.allTimeTotal, icon: TrendingUp, sub: "todo o período" }
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Analytics &amp; BI</h1>
        <p className="mt-1 text-sm text-navy-500">
          Acompanhe o uso do site: acessos, conteúdos mais procurados e áreas de atuação em destaque.
        </p>
      </div>

      {!data ? (
        <div className="card p-8 text-sm text-navy-600">
          Não foi possível carregar as métricas. Verifique as variáveis do Supabase e se a
          migração <code className="rounded bg-navy-800/10 px-1.5 py-0.5">migrations_v9_analytics.sql</code>{" "}
          foi aplicada.
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-gold-500/15 text-gold-600">
                    <c.icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-navy-900">
                  {nf.format(c.value)}
                </p>
                <p className="text-sm font-medium text-navy-600">{c.label}</p>
                <p className="text-xs text-navy-400">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfico de linha — evolução diária */}
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
              <TrendingUp className="h-5 w-5 text-gold-600" /> Evolução dos acessos diários
            </h2>
            <p className="mt-1 text-xs text-navy-500">Últimos 30 dias.</p>
            <div className="mt-5">
              <DailyViewsChart data={data.daily} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Barra — conteúdos mais acessados */}
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
                <BarChart3 className="h-5 w-5 text-gold-600" /> Conteúdos mais acessados
              </h2>
              <p className="mt-1 text-xs text-navy-500">Artigos com maior interesse.</p>
              <div className="mt-5">
                <TopContentBarChart data={data.topArticles} />
              </div>
            </section>

            {/* Barra — atuações mais visitadas */}
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
                <BarChart3 className="h-5 w-5 text-gold-600" /> Atuações mais visitadas
              </h2>
              <p className="mt-1 text-xs text-navy-500">Páginas de atuação em destaque.</p>
              <div className="mt-5">
                <TopContentBarChart data={data.topServices} />
              </div>
            </section>
          </div>

          {/* Pizza — distribuição por tipo de conteúdo */}
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
              <PieChart className="h-5 w-5 text-gold-600" /> Distribuição por tipo de conteúdo
            </h2>
            <p className="mt-1 text-xs text-navy-500">
              Comparação do engajamento entre páginas, artigos e áreas de atuação.
            </p>
            <div className="mt-5">
              <ContentTypePieChart data={data.byContentType} />
            </div>
          </section>

          {/* Ranking textual (acessibilidade + fallback dos gráficos) */}
          {(data.topArticles.length > 0 || data.topServices.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              <RankList title="Top conteúdos" items={data.topArticles} />
              <RankList title="Top atuações" items={data.topServices} />
            </div>
          )}

          <p className="text-xs text-navy-400">
            Os dados são anonimizados (nenhum IP é armazenado). Tipos rastreados:{" "}
            {Object.values(CONTENT_TYPE_LABELS).join(", ")}.
          </p>
        </>
      )}
    </div>
  );
}

/** Lista textual de ranking (reforça os gráficos e melhora acessibilidade). */
function RankList({
  title,
  items
}: {
  title: string;
  items: { id: string; title: string; total: number }[];
}) {
  return (
    <section className="card p-6">
      <h2 className="font-display text-lg font-semibold text-navy-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-navy-500">Sem dados no período.</p>
      ) : (
        <ol className="mt-4 divide-y divide-navy-800/5">
          {items.map((item, i) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800/10 text-xs font-bold text-navy-700">
                  {i + 1}
                </span>
                <span className="truncate text-sm text-navy-700">{item.title}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-navy-900">
                {nf.format(item.total)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

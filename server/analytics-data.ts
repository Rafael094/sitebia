import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type { PageViewContentType } from "@/lib/types";

/**
 * Camada de dados do módulo ANALYTICS / BI (somente servidor).
 * Lê a tabela `page_views` via service_role e devolve métricas já agregadas
 * para o painel. As agregações são feitas em memória sobre uma JANELA limitada
 * de tempo (padrão 90 dias), adequada ao volume de um site institucional.
 */

export interface DailyPoint {
  /** Data no formato ISO curto (YYYY-MM-DD). */
  date: string;
  /** Rótulo legível pt-BR (ex.: "05/09"). */
  label: string;
  total: number;
}

export interface TopItem {
  id: string;
  title: string;
  slug: string | null;
  total: number;
}

export interface ContentTypeSlice {
  type: PageViewContentType;
  label: string;
  total: number;
}

export interface AnalyticsOverview {
  todayTotal: number;
  monthTotal: number;
  allTimeTotal: number;
  uniqueVisitors: number; // visitantes únicos (hash) nos últimos 30 dias
  windowDays: number;
  daily: DailyPoint[];
  topArticles: TopItem[];
  topServices: TopItem[];
  byContentType: ContentTypeSlice[];
}

/** Rótulo pt-BR para cada tipo de conteúdo rastreado. */
export const CONTENT_TYPE_LABELS: Record<PageViewContentType, string> = {
  home: "Página inicial",
  artigo: "Conteúdos (artigos)",
  atuacao: "Atuações",
  contato: "Contato",
  international: "International",
  page: "Outras páginas"
};

interface ViewRow {
  created_at: string;
  content_type: PageViewContentType;
  content_id: string | null;
  content_slug: string | null;
  content_title: string | null;
  session_hash: string | null;
}

/** Início do dia (00:00) no fuso local do servidor. */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Início do mês corrente (dia 1, 00:00). */
function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Data (YYYY-MM-DD) no fuso local — usada para agrupar a série diária. */
function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Rótulo curto pt-BR (DD/MM). */
function shortLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

/** Consulta a contagem exata (head) com um filtro opcional de data. */
async function countSince(sinceISO?: string): Promise<number> {
  const admin = getAdminSupabaseClient();
  let query = admin.from("page_views").select("*", { count: "exact", head: true });
  if (sinceISO) query = query.gte("created_at", sinceISO);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * AGREGAÇÃO PURA (sem I/O): transforma linhas de `page_views` e os totais já
 * consultados em um AnalyticsOverview. Isolada para ser testável.
 */
export function aggregateOverview(
  rows: ViewRow[],
  totals: { todayTotal: number; monthTotal: number; allTimeTotal: number },
  windowDays: number,
  now: Date = new Date()
): AnalyticsOverview {
  // --- Série diária (últimos 30 dias, incluindo dias sem acesso) ----------
  const dayBuckets = new Map<string, number>();
  // --- Visitantes únicos (30 dias) ---------------------------------------
  const sessions30 = new Set<string>();
  const sessStart = new Date(now);
  sessStart.setDate(sessStart.getDate() - 30);
  // --- Agrupamentos por conteúdo / tipo ----------------------------------
  const articleMap = new Map<string, TopItem>();
  const serviceMap = new Map<string, TopItem>();
  const typeMap = new Map<PageViewContentType, number>();

  for (const row of rows) {
    const created = new Date(row.created_at);

    // Série diária dos últimos 30 dias.
    const daysAgo = (now.getTime() - created.getTime()) / 86_400_000;
    if (daysAgo >= 0 && daysAgo <= 30) {
      const key = localDayKey(created);
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }

    // Visitantes únicos (30 dias).
    if (created >= sessStart && row.session_hash) {
      sessions30.add(row.session_hash);
    }

    // Distribuição por tipo de conteúdo.
    typeMap.set(row.content_type, (typeMap.get(row.content_type) ?? 0) + 1);

    // Rankings de artigos e atuações.
    if (row.content_type === "artigo") {
      accumulate(articleMap, row);
    } else if (row.content_type === "atuacao") {
      accumulate(serviceMap, row);
    }
  }

  // Monta a série diária com todos os dias do período (mesmo os zerados).
  const daily: DailyPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDayKey(d);
    daily.push({ date: key, label: shortLabel(d), total: dayBuckets.get(key) ?? 0 });
  }

  // Top artigos / atuações (ordenados por acessos).
  const topArticles = [...articleMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const topServices = [...serviceMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Distribuição por tipo (ordenada, sem tipos zerados).
  const byContentType: ContentTypeSlice[] = [...typeMap.entries()]
    .map(([type, total]) => ({
      type,
      label: CONTENT_TYPE_LABELS[type] ?? type,
      total
    }))
    .sort((a, b) => b.total - a.total);

  return {
    todayTotal: totals.todayTotal,
    monthTotal: totals.monthTotal,
    allTimeTotal: totals.allTimeTotal,
    uniqueVisitors: sessions30.size,
    windowDays,
    daily,
    topArticles,
    topServices,
    byContentType
  };
}

/**
 * Métricas completas do dashboard de BI.
 * `windowDays` controla a janela usada nos gráficos (padrão: 90 dias).
 */
export async function getAnalyticsOverview(windowDays = 90): Promise<AnalyticsOverview> {
  const admin = getAdminSupabaseClient();

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - windowDays);
  const windowStartISO = windowStart.toISOString();

  // --- Totais (contagens exatas e baratas) -------------------------------
  const [todayTotal, monthTotal, allTimeTotal] = await Promise.all([
    countSince(startOfToday().toISOString()),
    countSince(startOfMonth().toISOString()),
    countSince()
  ]);

  // --- Janela de dados para os gráficos ----------------------------------
  const { data, error } = await admin
    .from("page_views")
    .select(
      "created_at, content_type, content_id, content_slug, content_title, session_hash"
    )
    .gte("created_at", windowStartISO)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as ViewRow[];

  return aggregateOverview(
    rows,
    { todayTotal, monthTotal, allTimeTotal },
    windowDays,
    now
  );
}

/** Soma uma linha de visualização ao mapa de ranking (artigo/serviço). */
function accumulate(map: Map<string, TopItem>, row: ViewRow) {
  const key = row.content_id ?? row.content_slug ?? row.content_title ?? "?";
  const current = map.get(key);
  if (current) {
    current.total += 1;
  } else {
    map.set(key, {
      id: row.content_id ?? key,
      title: row.content_title ?? row.content_slug ?? "(sem título)",
      slug: row.content_slug,
      total: 1
    });
  }
}

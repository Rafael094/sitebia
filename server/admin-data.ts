import { cache } from "react";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Article, ContactMessage, Service } from "@/lib/types";

/**
 * Leituras do PAINEL ADMINISTRATIVO.
 * Usam o cliente admin (service_role) para enxergar rascunhos e ignorar RLS.
 */

export const listAdminServices = cache(async (): Promise<Service[]> => {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("services")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export async function getAdminService(id: string): Promise<Service | null> {
  const admin = getAdminSupabaseClient();
  const { data } = await admin.from("services").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export const listAdminArticles = cache(async (): Promise<Article[]> => {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export async function getAdminArticle(id: string): Promise<Article | null> {
  const admin = getAdminSupabaseClient();
  const { data } = await admin.from("articles").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export const listAdminMessages = cache(async (): Promise<ContactMessage[]> => {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

/** Métricas do dashboard. */
export async function getDashboardMetrics() {
  const [services, articles, messages] = await Promise.all([
    listAdminServices(),
    listAdminArticles(),
    listAdminMessages()
  ]);

  return {
    servicesCount: services.length,
    articlesCount: articles.length,
    publishedCount: articles.filter((a) => a.is_published).length,
    draftsCount: articles.filter((a) => !a.is_published).length,
    messagesCount: messages.length,
    unreadCount: messages.filter((m) => !m.is_read).length,
    latestMessages: messages.slice(0, 5),
    latestArticles: articles.slice(0, 5)
  };
}

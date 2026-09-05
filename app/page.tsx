import type { Metadata } from "next";

import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import ServicesOverview from "@/components/home/ServicesOverview";
import Journey from "@/components/home/Journey";
import LatestArticles from "@/components/home/LatestArticles";
import CtaBanner from "@/components/ui/CtaBanner";
import { SITE } from "@/lib/constants";
import { getActiveServices, getPublishedArticles } from "@/lib/queries";

export const metadata: Metadata = {
  title: SITE.title(),
  description: SITE.description
};

/**
 * Seguimento padrão no Next: por padrão, páginas de GET são estáticas a menos
 * que leiam dados dinâmicos (cookies) — a camada Supabase lê cookies, então o
 * Next revalida/desativa cache conforme necessário.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Busca os dados no servidor. Gestão de erro: caso o banco ainda não esteja
  // totalmente populado, cai nas listas vazias para não quebrar a renderização.
  const [services, articles] = await Promise.all([
    getActiveServices(4).catch(() => []),
    getPublishedArticles({ limit: 3 }).catch(() => [])
  ]);

  return (
    <>
      <Hero />
      <About />
      <ServicesOverview services={services} />
      <Journey />
      <LatestArticles articles={articles} />
      <CtaBanner />
    </>
  );
}

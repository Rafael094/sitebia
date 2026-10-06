// ============================================================================
// Registro das PÁGINAS estáticas com SEO editável pelo painel.
// ----------------------------------------------------------------------------
// Diferente de `page_contents` (que edita blocos/seções dentro de uma página),
// aqui o alvo é o <head> da PÁGINA INTEIRA: título, description, keywords e
// Open Graph. Cada entrada tem uma `key` estável (a própria rota) usada como
// chave da tabela `page_seo`.
//
// Os valores de fallback refletem o que o site exibe HOJE (metadata fixo em
// cada page.tsx) — assim o <head> nunca fica vazio, mesmo sem dados no banco.
// ============================================================================

import { SITE } from "@/lib/constants";

/** Identificador estável de uma página com SEO editável (a rota pública). */
export type PageSeoKey =
  | "/"
  | "/atuacao"
  | "/conteudos"
  | "/contato"
  | "/international";

export interface PageSeoMeta {
  /** Rótulo exibido no painel. */
  label: string;
  /** Agrupamento no painel. */
  group: string;
  /** Dica curta (o que essa página cobre). */
  hint: string;
  /** Slug usado na URL do painel (/admin/seo/[slug]) — sem barras. */
  slug: string;
  /** Rota pública correspondente. */
  path: string;
  /** Título padrão (fallback) — não inclui a marca. */
  defaultTitle: string;
  /** Descrição padrão (fallback). */
  defaultDescription: string;
  /** Palavras-chave padrão (fallback), separadas por vírgula. */
  defaultKeywords?: string;
  /** Locale Open Graph da página. */
  locale: string;
  /** Idioma do conteúdo (para o `<head>`). */
  lang: string;
}

/** Ordem e metadados de cada página gerenciável no painel. */
export const PAGE_SEO_REGISTRY: Record<PageSeoKey, PageSeoMeta> = {
  "/": {
    label: "Home",
    group: "Páginas do site",
    hint: "Página inicial (/) — vitrine principal do site.",
    slug: "home",
    path: "/",
    defaultTitle: SITE.title(),
    defaultDescription: SITE.description,
    locale: "pt_BR",
    lang: "pt-BR"
  },
  "/atuacao": {
    label: "Áreas de Atuação",
    group: "Páginas do site",
    hint: "Listagem de serviços (/atuacao).",
    slug: "atuacao",
    path: "/atuacao",
    defaultTitle: "Áreas de Atuação",
    defaultDescription:
      "Conheça todas as áreas de atuação: diagnóstico de PI, estruturação de portfólio, conexão pesquisa-mercado e contratos de transferência de tecnologia.",
    locale: "pt_BR",
    lang: "pt-BR"
  },
  "/conteudos": {
    label: "Conteúdos",
    group: "Páginas do site",
    hint: "Listagem de artigos (/conteudos).",
    slug: "conteudos",
    path: "/conteudos",
    defaultTitle: "Conteúdos",
    defaultDescription:
      "Artigos, análises e notas sobre transferência de tecnologia, propriedade intelectual e contratos & parcerias.",
    locale: "pt_BR",
    lang: "pt-BR"
  },
  "/contato": {
    label: "Contato",
    group: "Páginas do site",
    hint: "Formulário e canais de contato (/contato).",
    slug: "contato",
    path: "/contato",
    defaultTitle: "Contato",
    defaultDescription:
      "Entre em contato com Bianca Martins para consultoria em transferência de tecnologia e propriedade intelectual.",
    locale: "pt_BR",
    lang: "pt-BR"
  },
  "/international": {
    label: "International Clients",
    group: "Páginas do site",
    hint: "Landing page em inglês (/international).",
    slug: "international",
    path: "/international",
    defaultTitle:
      "International Clients | IP, Innovation & Technology Transfer in Brazil",
    defaultDescription:
      "Brazilian legal and strategic support for foreign companies and international law firms seeking intellectual property protection, market entry and innovation partnerships in Brazil.",
    defaultKeywords: [
      "intellectual property Brazil",
      "trademark registration Brazil",
      "trademark lawyer Brazil",
      "patent protection Brazil",
      "Brazilian IP lawyer",
      "IP protection Brazil",
      "technology transfer Brazil",
      "innovation partnerships Brazil",
      "Brazil market entry",
      "Brazilian IP counsel"
    ].join(", "),
    locale: "en_US",
    lang: "en-US"
  }
};

/** Lista ordenada das chaves (espelha a ordem do painel). */
export const PAGE_SEO_KEYS: PageSeoKey[] = [
  "/",
  "/atuacao",
  "/conteudos",
  "/contato",
  "/international"
];

/** Agrupamentos exibidos na listagem do painel. */
export const PAGE_SEO_GROUPS = ["Páginas do site"] as const;

/** Estreita uma string arbitrária para uma PageSeoKey válida (ou `null`). */
export function asPageSeoKey(value: string): PageSeoKey | null {
  return (PAGE_SEO_KEYS as string[]).includes(value) ? (value as PageSeoKey) : null;
}

/** Localiza a chave a partir do slug usado na URL do painel. */
export function asPageSeoSlug(slug: string): PageSeoKey | null {
  const found = PAGE_SEO_KEYS.find((k) => PAGE_SEO_REGISTRY[k].slug === slug);
  return found ?? null;
}

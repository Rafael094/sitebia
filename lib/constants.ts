import type { ArticleCategory, SiteContactLinks } from "@/lib/types";

// ============================================================================
// Constantes globais de configuração do site
// ============================================================================

/** Metadados básicos de SEO. */
export const SITE = {
  name: "Bianca Martins",
  role: "Transferência de Tecnologia & Propriedade Intelectual",
  description:
    "Consultoria estratégica em transferência de tecnologia e propriedade intelectual: diagnóstico, estruturação, conexão pesquisa-mercado e contratos sob medida.",
  title: (suffix = "") =>
    suffix ? `${suffix} | Bianca Martins` : "Bianca Martins — Transferência de Tecnologia & PI"
} as const;

/** Menu principal do site público. */
export const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Atuação", href: "/atuacao" },
  { label: "Conteúdos", href: "/conteudos" },
  { label: "Contato", href: "/contato" }
] as const;

/** Menu do painel administrativo. */
export const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Serviços", href: "/admin/servicos" },
  { label: "Conteúdos", href: "/admin/conteudos" },
  { label: "Mensagens", href: "/admin/mensagens" },
  { label: "Configurações", href: "/admin/configuracoes" }
] as const;

/** Categorias de artigos (rótulo de exibição + valor usado no slug/SQL). */
export const ARTICLE_CATEGORIES: Record<
  ArticleCategory,
  { label: string; description: string }
> = {
  "transferencia-de-tecnologia": {
    label: "Transferência de Tecnologia",
    description: "Licenciamento, cessão e inovação aberta."
  },
  "propriedade-intelectual": {
    label: "Propriedade Intelectual",
    description: "Patentes, marcas, direitos autorais e segredos."
  },
  "contratos-e-parcerias": {
    label: "Contratos & Parcerias",
    description: "Acordos, codesenvolvimento e parcerias de P&D."
  }
};

/** Lista auxiliar no formato ordenável para menus/selects. */
export const ARTICLE_CATEGORY_LIST = Object.entries(ARTICLE_CATEGORIES).map(
  ([value, { label, description }]) => ({ value: value as ArticleCategory, label, description })
);

/** Canais de contato padrão (usados enquanto o painel não salvar outra). */
export const DEFAULT_CONTACT_CHANNELS: SiteContactLinks = {
  whatsapp: "https://wa.me/5511999999999",
  email: "contato@biancamartins.com.br",
  instagram: "https://instagram.com/",
  linkedin: "https://www.linkedin.com/",
  address: "Londrina — PR & atendimento remoto para todo o país",
  hours: "Segunda a sexta, das 9h às 18h"
};

/** Nome do bucket de capas no Supabase Storage. */
export const COVER_BUCKET = "article-covers";

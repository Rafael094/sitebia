import type { ArticleCategoryRecord, SiteContactLinks } from "@/lib/types";

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
  { label: "International Clients", href: "/international" },
  { label: "Contato", href: "/contato" }
] as const;

/** Menu do painel administrativo. */
export const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Serviços", href: "/admin/servicos" },
  { label: "Conteúdos", href: "/admin/conteudos" },
  { label: "Categorias", href: "/admin/conteudos/categorias" },
  { label: "IA & Conteúdos", href: "/admin/ia-conteudos" },
  { label: "SEO das páginas", href: "/admin/seo" },
  { label: "Analytics & BI", href: "/admin/analytics" },
  { label: "Mensagens", href: "/admin/mensagens" },
  { label: "Seções do site", href: "/admin/secoes" },
  { label: "Configurações", href: "/admin/configuracoes" }
] as const;

/**
 * Categorias padrão usadas como fallback enquanto a migração v10 não foi
 * aplicada (ou se o banco estiver indisponível). Depois da migração, o painel
 * /admin/conteudos/categorias passa a ser a fonte oficial.
 */
export const DEFAULT_ARTICLE_CATEGORIES: ArticleCategoryRecord[] = [
  {
    id: "default-transferencia-de-tecnologia",
    slug: "transferencia-de-tecnologia",
    label: "Transferência de Tecnologia",
    description: "Licenciamento, cessão e inovação aberta.",
    order_index: 10,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: "default-propriedade-intelectual",
    slug: "propriedade-intelectual",
    label: "Propriedade Intelectual",
    description: "Patentes, marcas, direitos autorais e segredos.",
    order_index: 20,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: "default-contratos-e-parcerias",
    slug: "contratos-e-parcerias",
    label: "Contratos & Parcerias",
    description: "Acordos, codesenvolvimento e parcerias de P&D.",
    order_index: 30,
    is_active: true,
    created_at: "",
    updated_at: ""
  }
];

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

/** Nome do bucket de uploads públicos (imagens enviadas pelo painel: Hero etc.). */
export const UPLOADS_BUCKET = "uploads";

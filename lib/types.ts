// ============================================================================
// Tipos e tipagem de banco de dados (espelham o schema.sql do Supabase)
// ============================================================================

/** Canais públicos de contato (WhatsApp, e-mail e redes) exibidos no site. */
export interface SiteContactLinks {
  whatsapp: string;
  email: string;
  instagram: string;
  linkedin: string;
}

/** Linha única (id = 1) com os canais editáveis pelo painel. */
export interface SiteSettings {
  id: number;
  whatsapp_link: string;
  contact_email: string;
  instagram_link: string;
  linkedin_link: string;
  updated_at: string;
}

/** Categorias permitidas para os artigos/conteúdos. */
export type ArticleCategory =
  | "transferencia-de-tecnologia"
  | "propriedade-intelectual"
  | "contratos-e-parcerias";

export interface Service {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  /** Público-alvo (linha de texto livre, ex.: separado por quebras \n). */
  audience: string;
  /** Problemas que o serviço resolve. */
  problems: string;
  /** Escopo / entregas do serviço. */
  scope: string;
  /** Nome do ícone Lucide utilizado no card. */
  icon: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  summary: string;
  /** Corpo do artigo em Markdown. */
  content: string;
  /** URL da imagem de capa hospedada no Supabase Storage. */
  cover_image_url: string;
  is_published: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Tipagem "surrogate" do banco usada pelo Supabase (Database).
 * Mantida enxuta e alinhada com as interfaces acima para dar autocomplete
 * seguro (`.from("services")`, etc.).
 */
export interface Database {
  public: {
    Tables: {
      services: {
        Row: Service;
        Insert: Partial<Omit<Service, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Service, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      articles: {
        Row: Article;
        Insert: Partial<Omit<Article, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Article, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Pick<
          ContactMessage,
          "name" | "email" | "phone" | "subject" | "message"
        >;
        Update: Partial<ContactMessage>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      article_category: ArticleCategory;
    };
    CompositeTypes: Record<string, never>;
  };
}

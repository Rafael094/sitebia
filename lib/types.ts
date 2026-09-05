// ============================================================================
// Tipos e tipagem de banco de dados (espelham o schema.sql do Supabase)
// ============================================================================

/** Canais públicos de contato (WhatsApp, e-mail, redes e informações de endereço/horário). */
export interface SiteContactLinks {
  whatsapp: string;
  email: string;
  instagram: string;
  linkedin: string;
  /** Endereço/área de atendimento exibido no site (ex.: "Londrina — PR & remoto"). */
  address: string;
  /** Horário de atendimento (ex.: "Segunda a sexta, das 9h às 18h"). */
  hours: string;
}

/** Linha única (id = 1) com os canais/informações editáveis pelo painel. */
export interface SiteSettings {
  id: number;
  whatsapp_link: string;
  contact_email: string;
  /** E-mail de destino das mensagens vindas do formulário público (anti-spam). */
  contact_recipient_email?: string;
  instagram_link: string;
  linkedin_link: string;
  contact_address: string;
  contact_hours: string;
  updated_at: string;
}

/** Controle anti-spam de envio por IP (janela de 1 hora). */
export interface ContactRateLimit {
  ip: string;
  window_start: string;
  count: number;
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
  /** Meta description SEO (gerada automaticamente quando vazia). */
  meta_description?: string;
  /** Tags/keywords de SEO (populadas automaticamente). */
  tags?: string[];
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

/** Identificador da tabela page_contents (cada seção/banner do site). */
export type PageSectionKey =
  | "home_hero"
  | "home_services_header"
  | "home_journey_header"
  | "home_cta"
  | "page_services_header"
  | "page_articles_header"
  | "page_contact_header"
  | "home_about";

/** Campos editáveis de cada seção — espelham as colunas da tabela page_contents. */
export interface PageContent {
  section_key: PageSectionKey;
  badge_text?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  quote_text?: string;
  button_primary_label?: string;
  button_primary_url?: string;
  button_secondary_label?: string;
  button_secondary_url?: string;
  badge_extra_title?: string;
  badge_extra_sub?: string;
  image_url?: string;
  updated_at?: string;
}

/** Campo "seed"/texto já preenchido de um PageContent salvo. */
export type PageContentValue = Partial<PageContent>;

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
      contact_rate_limits: {
        Row: ContactRateLimit;
        Insert: Pick<ContactRateLimit, "ip" | "count"> & {
          window_start?: string;
        };
        Update: Partial<ContactRateLimit>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      page_contents: {
        Row: PageContent;
        Insert: Partial<
          Pick<
            PageContent,
            | "section_key"
            | "badge_text"
            | "title"
            | "subtitle"
            | "description"
            | "quote_text"
            | "button_primary_label"
            | "button_primary_url"
            | "button_secondary_label"
            | "button_secondary_url"
            | "badge_extra_title"
            | "badge_extra_sub"
            | "image_url"
          >
        >;
        Update: Partial<
          Pick<
            PageContent,
            | "section_key"
            | "badge_text"
            | "title"
            | "subtitle"
            | "description"
            | "quote_text"
            | "button_primary_label"
            | "button_primary_url"
            | "button_secondary_label"
            | "button_secondary_url"
            | "badge_extra_title"
            | "badge_extra_sub"
            | "image_url"
          >
        >;
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

// ============================================================================
// Registro dos conteúdos dinâmicos de seções (page_contents).
// Cada entrada reflete o texto que o site exibe HOJE, servindo de fallback
// (SEO/site nunca abre em branco) e de pré-visualização no painel admin.
// ============================================================================

import type { PageContent, PageSectionKey } from "@/lib/types";

/** Conteúdos padrão de cada seção â€” mesmo texto/visual atuais (fallback). */
export const DEFAULT_PAGE_CONTENTS: Record<PageSectionKey, PageContent> = {
  home_hero: {
    section_key: "home_hero",
    badge_text: "CONSULTORIA & ASSESSORIA ESTRATÃ‰GICA",
    title: "TRANSFERÃŠNCIA DE TECNOLOGIA E PROPRIEDADE INTELECTUAL",
    subtitle: "Transformo pesquisa e inovação em negócios seguros.",
    description:
      "Do diagnóstico da proteção ao contrato que destrava valor entre universidades, empresas e pesquisadores.",
    quote_text:
      "â€œInovar sem proteger é construir sobre areia. Estruturo cada etapa para que a sua tecnologia gere valor â€” com segurança jurídica.â€",
    button_primary_label: "Agendar diagnóstico",
    button_primary_url: "/contato",
    button_secondary_label: "Conhecer a atuação",
    button_secondary_url: "/atuacao",
    badge_extra_title: "+10 ANOS",
    badge_extra_sub: "dedicados a PI & inovação",
    image_url: "/images/bianca-martins.jpg"
  },
  home_services_header: {
    section_key: "home_services_header",
    badge_text: "O QUE EU FAÃ‡O",
    title: "ATUAÃ‡ÃƒO SOB MEDIDA PARA O CICLO DE VIDA DA INOVAÃ‡ÃƒO",
    description:
      "Da primeira avaliação de patenteabilidade até o contrato que licencia a tecnologia, conduzo cada etapa com rigor técnico e visão de negócio."
  },
  home_journey_header: {
    section_key: "home_journey_header",
    badge_text: "COMO POSSO AJUDAR",
    title: "UMA JORNADA CLARA, DO ATIVO AO CONTRATO",
    description:
      "Cada projeto passa por etapas estruturadas â€” você sabe exatamente em que ponto está e para onde vamos."
  },
  home_cta: {
    section_key: "home_cta",
    badge_text: "CONTATO",
    title:
      "PRONTA PARA ESTRUTURAR A PROTEÃ‡ÃƒO E A TRANSFERÃŠNCIA DA SUA TECNOLOGIA?",
    description:
      "Vamos conversar sobre o seu caso em um diagnóstico inicial â€” sem compromisso.",
    button_primary_label: "Agendar uma conversa",
    button_primary_url: "/contato",
    button_secondary_label: "WhatsApp direto"
  },
  page_services_header: {
    section_key: "page_services_header",
    badge_text: "ATUAÃ‡ÃƒO",
    title: "ESTRATÃ‰GIA COMPLETA PARA PROTEGER E TRANSFERIR TECNOLOGIA",
    description:
      "Cada projeto é endereçado por um especialista que une técnica jurídica e visão de negócio."
  },
  page_articles_header: {
    section_key: "page_articles_header",
    badge_text: "CONTEÃšDOS",
    title: "REFLEXÃ•ES, ANÁLISES E NOTAS TÃ‰CNICAS",
    description:
      "Conteúdo relevante para quem inova, protege e transfere tecnologia â€” produzido por quem vive esse mercado todos os dias."
  },
  page_contact_header: {
    section_key: "page_contact_header",
    badge_text: "CONTATO",
    title: "VAMOS CONVERSAR SOBRE A SUA TECNOLOGIA?",
    description: "Conte um pouco sobre o seu projeto, inovação ou parceria."
  },
  home_about: {
    section_key: "home_about",
    badge_text: "SOBRE",
    title: "Bianca Martins",
    description:
      "Atuação em propriedade intelectual ligada à interface pesquisaâ€“mercado."
  },

  // ==========================================================================
  // Landing page internacional — "International Clients" (/international)
  // Textos em inglês. O botão principal abre o formulário de contato (#contact).
  // image_url (quando definida) aparece como composição editorial no Hero.
  // ==========================================================================
  intl_hero: {
    section_key: "intl_hero",
    badge_text: "INTERNATIONAL CLIENTS",
    title:
      "Protect your IP. Enter the Brazilian market. Build innovation partnerships.",
    subtitle:
      "Strategic legal and innovation support for foreign companies and international law firms navigating intellectual property, technology transfer and innovation opportunities in Brazil.",
    quote_text:
      "Based in Brazil. Working across borders.",
    button_primary_label: "Talk to Bianca",
    button_primary_url: "#contact",
    button_secondary_label: "Explore our services",
    button_secondary_url: "#services",
    image_url: ""
  },
  intl_trust: {
    section_key: "intl_trust",
    badge_text: "HOW WE HELP",
    title: "Three ways we support international clients",
    description:
      "A focused practice built around intellectual property, market entry and innovation — delivered by a Brazilian team for clients working across jurisdictions."
  },
  intl_services: {
    section_key: "intl_services",
    badge_text: "SERVICES",
    title: "How we can support your business in Brazil",
    description:
      "Entering a new market requires more than local knowledge. It requires a strategic understanding of how intellectual property, contracts, regulation and innovation interact."
  },
  intl_ip: {
    section_key: "intl_ip",
    badge_text: "INTELLECTUAL PROPERTY",
    title: "Protect your intellectual property in Brazil",
    description:
      "Brazil is one of the world's major markets. Protecting your brand, technology and other intellectual assets locally should be part of your market-entry strategy.",
    button_primary_label: "Protect your IP in Brazil",
    button_primary_url: "#contact"
  },
  intl_market_entry: {
    section_key: "intl_market_entry",
    badge_text: "BRAZIL MARKET ENTRY",
    title: "Entering the Brazilian market?",
    description:
      "Brazil offers significant commercial and innovation opportunities, but navigating its legal, intellectual property and regulatory environment requires local expertise.",
    button_primary_label: "Discuss your Brazil market entry",
    button_primary_url: "#contact"
  },
  intl_innovation: {
    section_key: "intl_innovation",
    badge_text: "INNOVATION & TECHNOLOGY TRANSFER",
    title: "Build innovation partnerships in Brazil",
    description:
      "Brazil has a diverse innovation ecosystem connecting companies, universities, research institutions, startups and technology-based organizations. We support companies seeking to establish or structure these relationships.",
    button_primary_label: "Discuss an innovation project",
    button_primary_url: "#contact"
  },
  intl_law_firms: {
    section_key: "intl_law_firms",
    badge_text: "FOR INTERNATIONAL LAW FIRMS",
    title: "Looking for Brazilian IP support for your clients?",
    description:
      "We work with international law firms and intellectual property professionals that need reliable Brazilian support for their clients.",
    subtitle: "A reliable Brazilian partner for your international practice.",
    quote_text:
      "Confidentiality, responsiveness and clear communication are central to our international work.",
    button_primary_label: "Discuss a partnership",
    button_primary_url: "#contact"
  },
  intl_why: {
    section_key: "intl_why",
    badge_text: "WHY BIANCA",
    title: "Why work with Bianca?",
    description:
      "A single point of contact combining Brazilian legal expertise, business sense and cross-border communication."
  },
  intl_process: {
    section_key: "intl_process",
    badge_text: "HOW WE WORK",
    title: "A clear process for international clients",
    description:
      "A structured path from first conversation to implementation — you always know where you are and what comes next."
  },
  intl_about: {
    section_key: "intl_about",
    badge_text: "ABOUT",
    title: "Brazilian expertise. International perspective.",
    description:
      "Bianca Martins is a Brazilian lawyer and consultant focused on Intellectual Property, Innovation and Technology Transfer. Her practice sits at the intersection of legal strategy, innovation ecosystems, intellectual property and technology partnerships. She supports companies and organizations dealing with the Brazilian market, helping them protect intellectual assets, structure strategic relationships and navigate innovation opportunities.",
    image_url: "/images/bianca-martins.jpg"
  },
  intl_faq: {
    section_key: "intl_faq",
    badge_text: "FAQ",
    title: "Questions from international clients",
    description:
      "Common questions about protecting and commercializing intellectual property and building innovation partnerships in Brazil."
  },
  intl_cta: {
    section_key: "intl_cta",
    badge_text: "NEXT STEP",
    title: "Planning to enter or expand in Brazil?",
    description:
      "Let's discuss your intellectual property, market-entry or innovation needs.",
    button_primary_label: "Talk to Bianca",
    button_primary_url: "#contact",
    button_secondary_label: "Send an inquiry",
    button_secondary_url: "#contact"
  }
};

/** Campos que aceitam formatação rica (HTML). */
export const RICH_FIELDS: (keyof PageContent)[] = ["description", "quote_text"];

/** Rótulos curtos exibidos no formulário de cada campo. */
export const FIELD_LABELS: Record<keyof PageContent, string> = {
  section_key: "Identificador",
  badge_text: "Badge / eyebrow",
  title: "Título",
  subtitle: "Subtítulo",
  description: "Descrição / texto de apoio",
  quote_text: "Citação",
  button_primary_label: "Botão 1 (label)",
  button_primary_url: "Botão 1 (URL)",
  button_secondary_label: "Botão 2 (label)",
  button_secondary_url: "Botão 2 (URL)",
  badge_extra_title: "Selo â€” número",
  badge_extra_sub: "Selo â€” legenda",
  image_url: "Imagem (enviar arquivo)",
  updated_at: "Atualizado em"
};

/** Rotulagem por seção usada no painel /admin/secoes. */
export const SECTION_META: Record<
  PageSectionKey,
  { label: string; group: string; hint: string }
> = {
  home_hero: {
    label: "Hero da Home",
    group: "Home",
    hint: "Destaque principal com selo '+10 anos' e botões."
  },
  home_services_header: {
    label: "O que eu faço (Home)",
    group: "Home",
    hint: "Cabeçalho da grade de serviços."
  },
  home_journey_header: {
    label: "Como posso ajudar (Home)",
    group: "Home",
    hint: "Cabeçalho da jornada em 4 etapas."
  },
  home_cta: {
    label: "Banner CTA (global)",
    group: "Geral",
    hint: "Chamada institucional no fim de páginas internas e setores."
  },
  home_about: {
    label: "Sobre mim (Home)",
    group: "Home",
    hint: "Bloco 'Sobre' exibido depois do Hero."
  },
  page_services_header: {
    label: "Cabeçalho /atuacao",
    group: "Páginas internas",
    hint: "Hero da página /atuacao."
  },
  page_articles_header: {
    label: "Cabeçalho /conteudos",
    group: "Páginas internas",
    hint: "Hero da página /conteudos."
  },
  page_contact_header: {
    label: "Cabeçalho /contato",
    group: "Páginas internas",
    hint: "Hero da página /contato."
  },

  // --- Landing page internacional (/international) ---
  intl_hero: {
    label: "Hero — International",
    group: "International",
    hint: "Destaque principal (headline, subheadline e botões)."
  },
  intl_trust: {
    label: "Trust bar — International",
    group: "International",
    hint: "Faixa de posicionamento com três pilares."
  },
  intl_services: {
    label: "Services overview — International",
    group: "International",
    hint: "Cabeçalho da grade de serviços (4 cards)."
  },
  intl_ip: {
    label: "IP Protection — International",
    group: "International",
    hint: "Seção de propriedade intelectual e seu CTA."
  },
  intl_market_entry: {
    label: "Brazil Market Entry — International",
    group: "International",
    hint: "Seção de entrada no mercado brasileiro e seu CTA."
  },
  intl_innovation: {
    label: "Innovation & Tech Transfer — International",
    group: "International",
    hint: "Seção de inovação/transferência de tecnologia e seu CTA."
  },
  intl_law_firms: {
    label: "International Law Firms — International",
    group: "International",
    hint: "Seção de conversão para escritórios estrangeiros."
  },
  intl_why: {
    label: "Why Bianca — International",
    group: "International",
    hint: "Quatro pilares de diferenciação."
  },
  intl_process: {
    label: "How we work — International",
    group: "International",
    hint: "Processo em quatro etapas."
  },
  intl_about: {
    label: "About — International",
    group: "International",
    hint: "Bloco sobre Bianca (texto + foto)."
  },
  intl_faq: {
    label: "FAQ — International",
    group: "International",
    hint: "Título e descrição do acordeão de perguntas."
  },
  intl_cta: {
    label: "CTA final — International",
    group: "International",
    hint: "Chamada final com botões para o contato."
  }
};

/** Lista ordenada das seções gerenciáveis (painel). */
export const PAGE_SECTION_KEYS: PageSectionKey[] = [
  "home_hero",
  "home_services_header",
  "home_journey_header",
  "home_cta",
  "page_services_header",
  "page_articles_header",
  "page_contact_header",
  // International landing page
  "intl_hero",
  "intl_trust",
  "intl_services",
  "intl_ip",
  "intl_market_entry",
  "intl_innovation",
  "intl_law_firms",
  "intl_why",
  "intl_process",
  "intl_about",
  "intl_faq",
  "intl_cta"
];

/** Fallback válido de conteúdo de uma chave (o site nunca abre em branco). */
export function defaultFor(key: PageSectionKey): PageContent {
  return mergePageContentRow(key, null);
}

/**
 * Une banco + padrão por chave. Valores salvos vazios/null são ignorados para
 * que o padrão vigente apareça até que o admin realmente edite o campo.
 */
export function mergePageContentRow(
  key: PageSectionKey,
  row: Partial<PageContent> | null | undefined
): PageContent {
  const base = DEFAULT_PAGE_CONTENTS[key] ?? {};
  if (!row) return { ...base, section_key: key };
  const out: PageContent = { ...base, section_key: key };
  for (const [k, v] of Object.entries(row)) {
    const field = k as keyof PageContent;
    if (field === "section_key") continue;
    if (v === null || v === undefined) continue;
    const sv = String(v).trim();
    if (sv === "") continue; // vazio => mantém fallback
    (out as unknown as Record<string, unknown>)[field] = sv;
  }
  return out;
}





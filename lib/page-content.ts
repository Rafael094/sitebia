// ============================================================================
// Registro dos conteÃºdos dinÃ¢micos de seÃ§Ãµes (page_contents).
// Cada entrada reflete o texto que o site exibe HOJE, servindo de fallback
// (SEO/site nunca abre em branco) e de prÃ©-visualizaÃ§Ã£o no painel admin.
// ============================================================================

import type { PageContent, PageSectionKey } from "@/lib/types";

/** ConteÃºdos padrÃ£o de cada seÃ§Ã£o â€” mesmo texto/visual atuais (fallback). */
export const DEFAULT_PAGE_CONTENTS: Record<PageSectionKey, PageContent> = {
  home_hero: {
    section_key: "home_hero",
    badge_text: "CONSULTORIA & ASSESSORIA ESTRATÃ‰GICA",
    title: "TRANSFERÃŠNCIA DE TECNOLOGIA E PROPRIEDADE INTELECTUAL",
    subtitle: "Transformo pesquisa e inovaÃ§Ã£o em negÃ³cios seguros.",
    description:
      "Do diagnÃ³stico da proteÃ§Ã£o ao contrato que destrava valor entre universidades, empresas e pesquisadores.",
    quote_text:
      "â€œInovar sem proteger Ã© construir sobre areia. Estruturo cada etapa para que a sua tecnologia gere valor â€” com seguranÃ§a jurÃ­dica.â€",
    button_primary_label: "Agendar diagnÃ³stico",
    button_primary_url: "/contato",
    button_secondary_label: "Conhecer a atuaÃ§Ã£o",
    button_secondary_url: "/atuacao",
    badge_extra_title: "+10 ANOS",
    badge_extra_sub: "dedicados a PI & inovaÃ§Ã£o",
    image_url: "/images/1702302801691.jpg"
  },
  home_services_header: {
    section_key: "home_services_header",
    badge_text: "O QUE EU FAÃ‡O",
    title: "ATUAÃ‡ÃƒO SOB MEDIDA PARA O CICLO DE VIDA DA INOVAÃ‡ÃƒO",
    description:
      "Da primeira avaliaÃ§Ã£o de patenteabilidade atÃ© o contrato que licencia a tecnologia, conduzo cada etapa com rigor tÃ©cnico e visÃ£o de negÃ³cio."
  },
  home_journey_header: {
    section_key: "home_journey_header",
    badge_text: "COMO POSSO AJUDAR",
    title: "UMA JORNADA CLARA, DO ATIVO AO CONTRATO",
    description:
      "Cada projeto passa por etapas estruturadas â€” vocÃª sabe exatamente em que ponto estÃ¡ e para onde vamos."
  },
  home_cta: {
    section_key: "home_cta",
    badge_text: "CONTATO",
    title:
      "PRONTA PARA ESTRUTURAR A PROTEÃ‡ÃƒO E A TRANSFERÃŠNCIA DA SUA TECNOLOGIA?",
    description:
      "Vamos conversar sobre o seu caso em um diagnÃ³stico inicial â€” sem compromisso.",
    button_primary_label: "Agendar uma conversa",
    button_primary_url: "/contato",
    button_secondary_label: "WhatsApp direto"
  },
  page_services_header: {
    section_key: "page_services_header",
    badge_text: "ATUAÃ‡ÃƒO",
    title: "ESTRATÃ‰GIA COMPLETA PARA PROTEGER E TRANSFERIR TECNOLOGIA",
    description:
      "Cada projeto Ã© endereÃ§ado por um especialista que une tÃ©cnica jurÃ­dica e visÃ£o de negÃ³cio."
  },
  page_articles_header: {
    section_key: "page_articles_header",
    badge_text: "CONTEÃšDOS",
    title: "REFLEXÃ•ES, ANÃLISES E NOTAS TÃ‰CNICAS",
    description:
      "ConteÃºdo relevante para quem inova, protege e transfere tecnologia â€” produzido por quem vive esse mercado todos os dias."
  },
  page_contact_header: {
    section_key: "page_contact_header",
    badge_text: "CONTATO",
    title: "VAMOS CONVERSAR SOBRE A SUA TECNOLOGIA?",
    description: "Conte um pouco sobre o seu projeto, inovaÃ§Ã£o ou parceria."
  },
  home_about: {
    section_key: "home_about",
    badge_text: "SOBRE",
    title: "Bianca Martins",
    description:
      "AtuaÃ§Ã£o em propriedade intelectual ligada Ã  interface pesquisaâ€“mercado."
  }
};

/** Campos que aceitam formataÃ§Ã£o rica (HTML). */
export const RICH_FIELDS: (keyof PageContent)[] = ["description", "quote_text"];

/** RÃ³tulos curtos exibidos no formulÃ¡rio de cada campo. */
export const FIELD_LABELS: Record<keyof PageContent, string> = {
  section_key: "Identificador",
  badge_text: "Badge / eyebrow",
  title: "TÃ­tulo",
  subtitle: "SubtÃ­tulo",
  description: "DescriÃ§Ã£o / texto de apoio",
  quote_text: "CitaÃ§Ã£o",
  button_primary_label: "BotÃ£o 1 (label)",
  button_primary_url: "BotÃ£o 1 (URL)",
  button_secondary_label: "BotÃ£o 2 (label)",
  button_secondary_url: "BotÃ£o 2 (URL)",
  badge_extra_title: "Selo â€” nÃºmero",
  badge_extra_sub: "Selo â€” legenda",
  image_url: "Imagem (URL)",
  updated_at: "Atualizado em"
};

/** Rotulagem por seÃ§Ã£o usada no painel /admin/secoes. */
export const SECTION_META: Record<
  PageSectionKey,
  { label: string; group: string; hint: string }
> = {
  home_hero: {
    label: "Hero da Home",
    group: "Home",
    hint: "Destaque principal com selo '+10 anos' e botÃµes."
  },
  home_services_header: {
    label: "O que eu faÃ§o (Home)",
    group: "Home",
    hint: "CabeÃ§alho da grade de serviÃ§os."
  },
  home_journey_header: {
    label: "Como posso ajudar (Home)",
    group: "Home",
    hint: "CabeÃ§alho da jornada em 4 etapas."
  },
  home_cta: {
    label: "Banner CTA (global)",
    group: "Geral",
    hint: "Chamada institucional no fim de pÃ¡ginas internas e setores."
  },
  home_about: {
    label: "Sobre mim (Home)",
    group: "Home",
    hint: "Bloco 'Sobre' exibido depois do Hero."
  },
  page_services_header: {
    label: "CabeÃ§alho /atuacao",
    group: "PÃ¡ginas internas",
    hint: "Hero da pÃ¡gina /atuacao."
  },
  page_articles_header: {
    label: "CabeÃ§alho /conteudos",
    group: "PÃ¡ginas internas",
    hint: "Hero da pÃ¡gina /conteudos."
  },
  page_contact_header: {
    label: "CabeÃ§alho /contato",
    group: "PÃ¡ginas internas",
    hint: "Hero da pÃ¡gina /contato."
  }
};

/** Lista ordenada das seÃ§Ãµes gerenciÃ¡veis (painel). */
export const PAGE_SECTION_KEYS: PageSectionKey[] = [
  "home_hero",
  "home_services_header",
  "home_journey_header",
  "home_cta",
  "page_services_header",
  "page_articles_header",
  "page_contact_header"
];

/** Fallback vÃ¡lido de conteÃºdo de uma chave (o site nunca abre em branco). */
export function defaultFor(key: PageSectionKey): PageContent {
  return mergePageContentRow(key, null);
}

/**
 * Une banco + padrÃ£o por chave. Valores salvos vazios/null sÃ£o ignorados para
 * que o padrÃ£o vigente apareÃ§a atÃ© que o admin realmente edite o campo.
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
    if (sv === "") continue; // vazio => mantÃ©m fallback
    (out as unknown as Record<string, unknown>)[field] = sv;
  }
  return out;
}





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
  image_url: "Imagem (URL)",
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
  "page_contact_header"
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





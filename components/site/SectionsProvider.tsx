"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PageContent } from "@/lib/types";
import { PAGE_SECTION_KEYS, mergePageContentRow } from "@/lib/page-content";

/**
 * Disponibiliza os conteúdos dinâmicos de seções (page_contents), já lidos no
 * servidor, para componentes clientes do site (Hero, CTA etc.).
 * Mantemos os valores BRUTOS salvos no banco; ao renderizar cada seção aplica
 * o merge com o padrão — o site nunca fica em branco.
 */
const SectionsContext = createContext<Record<string, Partial<PageContent>>>(
  {}
);

export function SectionsProvider({
  contents,
  children
}: {
  contents: Record<string, Partial<PageContent>>;
  children: ReactNode;
}) {
  return (
    <SectionsContext.Provider value={contents}>
      {children}
    </SectionsContext.Provider>
  );
}

/** Conteúdo final (padrão + salvo) de uma chave, para componentes clientes. */
export function useSectionContent(
  key: (typeof PAGE_SECTION_KEYS)[number]
): PageContent {
  const saved = useContext(SectionsContext)[key];
  return mergePageContentRow(key, saved);
}

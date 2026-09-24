"use client";

import { useSectionContent } from "@/components/site/SectionsProvider";

/** Cabeçalho editorial da grade de serviços (badge + título + subtítulo). */
export default function ServicesHeader() {
  const c = useSectionContent("page_services_header");

  return (
    <header className="mb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
        {c.badge_text || "ATUAÇÃO"}
      </p>
      <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-normal uppercase text-white lg:text-4xl">
        {c.title || "Áreas de atuação"}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
        {c.description ||
          "Quatro frentes complementares que cobrem o ciclo de vida da inovação, do primeiro diagnóstico ao contrato assinado."}
      </p>
    </header>
  );
}

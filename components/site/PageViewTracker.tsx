"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Rastreador de acessos (Analytics / BI).
 * -----------------------------------------------------------------------
 * A cada mudança de rota PÚBLICA, envia a rota visitada para
 * `/api/analytics/view`, que resolve IP/User-Agent no servidor, anonimiza o
 * visitante e grava a visualização na tabela `page_views`.
 *
 * Fica montado uma única vez no layout raiz e cobre todas as páginas públicas
 * (inclusive navegação client-side). É "fire-and-forget": nunca bloqueia nem
 * quebra a experiência do visitante. Rotas do painel/API são ignoradas aqui e
 * também descartadas no servidor.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Ignora painel, API e autenticação.
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth")
    ) {
      return;
    }

    // Evita registros duplicados em re-render do mesmo caminho.
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({ path: pathname });

    try {
      // keepalive garante o envio mesmo durante a navegação.
      void fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      }).catch(() => {
        /* silencioso: analytics não pode impactar o visitante */
      });
    } catch {
      /* silencioso */
    }
  }, [pathname]);

  return null;
}

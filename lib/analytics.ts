import { createHash } from "node:crypto";

import type { PageViewContentType } from "@/lib/types";

/**
 * Utilidades do módulo de Analytics / BI.
 * -----------------------------------------------------------------------
 * Centraliza a ANONIMIZAÇÃO do visitante (LGPD) e a CLASSIFICAÇÃO da rota,
 * para que o registro de visualizações (Route Handler) fique enxuto.
 */

/** Salt do hash de sessão — mantém o hash estável e não reversível. */
const SESSION_SALT =
  process.env.ANALYTICS_SALT || "bianca-martins-analytics-v1";

/**
 * Gera um identificador ANÔNIMO e estável para o visitante a partir de
 * IP + User-Agent. É um hash SHA-256 com salt — não permite reverter para o
 * IP original e serve apenas para contar visitantes únicos.
 */
export function hashVisitor(ip: string, userAgent: string): string {
  const fingerprint = `${SESSION_SALT}:${ip}:${userAgent}`;
  return createHash("sha256").update(fingerprint).digest("hex");
}

/** Extrai apenas o host do referrer (sem caminho/query) — minimiza dados. */
export function safeReferrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.host || null;
  } catch {
    return null;
  }
}

export interface ClassifiedPath {
  contentType: PageViewContentType;
  slug: string | null;
}

/** Caminhos internos que NÃO devem ser rastreados (painel, API, auth). */
export function isTrackablePath(pathname: string): boolean {
  if (!pathname || !pathname.startsWith("/")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/auth")) return false;
  if (pathname.startsWith("/_next")) return false;
  return true;
}

/**
 * Classifica a rota em um tipo de conteúdo e, quando aplicável, extrai o slug.
 * Ex.: "/conteudos/meu-artigo" -> { contentType: "artigo", slug: "meu-artigo" }.
 */
export function classifyPath(pathname: string): ClassifiedPath {
  const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  if (clean === "/") return { contentType: "home", slug: null };

  const segments = clean.split("/").filter(Boolean);
  const [first, second] = segments;

  if (first === "conteudos") {
    return { contentType: "artigo", slug: second ?? null };
  }
  if (first === "atuacao") {
    return { contentType: "atuacao", slug: second ?? null };
  }
  if (first === "contato") return { contentType: "contato", slug: null };
  if (first === "international") {
    return { contentType: "international", slug: null };
  }

  return { contentType: "page", slug: null };
}

// ============================================================================
// URL pública canônica do site (para links absolutos de compartilhamento/SEO).
// ----------------------------------------------------------------------------
// Regras (nunca expõe `localhost` em links públicos):
//   1) `NEXT_PUBLIC_SITE_URL` (variável do Next.js) quando definida e válida;
//   2) caso contrário, o domínio OFICIAL de produção na Vercel.
// É isomórfico (roda no servidor e no cliente) — não importa APIs de Node.
// ============================================================================

/** Domínio oficial de produção (fallback seguro). */
export const PRODUCTION_SITE_URL = "https://sitebia-umber.vercel.app";

/** `true` quando a URL aponta para um host local (a ser evitado em links públicos). */
export function isLocalHostUrl(value: string | null | undefined): boolean {
  if (!value) return true;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return true;
  }
}

/**
 * Devolve a URL base pública do site, já sem barra final.
 * Prioriza `NEXT_PUBLIC_SITE_URL` e cai para a produção na Vercel.
 */
export function siteUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv && !isLocalHostUrl(fromEnv)) return fromEnv;
  return PRODUCTION_SITE_URL;
}

/**
 * Resolve uma URL absoluta a partir de um caminho relativo.
 * Caminhos que já são absolutos (`http(s)://`) são devolvidos como estão,
 * a menos que apontem para um host local (aí usamos a base pública).
 */
export function absoluteSiteUrl(path: string): string {
  const value = (path ?? "").trim();
  if (/^https?:\/\//i.test(value)) return isLocalHostUrl(value) ? "" : value;
  const base = siteUrl();
  const suffix = value.startsWith("/") ? value : `/${value}`;
  return `${base}${suffix}`;
}

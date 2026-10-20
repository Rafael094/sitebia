/**
 * Configuração pública do reCAPTCHA (segura para o navegador).
 * A chave é “inlinada” pelo Next.js no bundle do cliente.
 */
export const RECAPTCHA_SITE_KEY = (
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""
).trim();

/** true quando o widget deve ser exibido e o token exigido no envio. */
export const IS_RECAPTCHA_ENABLED = RECAPTCHA_SITE_KEY.length > 0;

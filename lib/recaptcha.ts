/**
 * Verificação server-side do Google reCAPTCHA v2 (caixa “Não sou um robô”).
 *
 * Ativação:
 *   - NEXT_PUBLIC_RECAPTCHA_SITE_KEY → chave pública (usada no navegador)
 *   - RECAPTCHA_SECRET_KEY           → chave secreta (somente servidor)
 *
 * Sem `RECAPTCHA_SECRET_KEY` a verificação é dispensada. Isso mantém o site
 * funcionando em desenvolvimento/antes da configuração, mas em produção as
 * duas variáveis devem estar preenchidas para o reCAPTCHA valer de fato.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export interface RecaptchaResult {
  /** true quando a validação passou (ou foi dispensada por falta de chave). */
  ok: boolean;
  /** true quando não há `RECAPTCHA_SECRET_KEY` configurada. */
  skipped: boolean;
  /** Códigos de erro devolvidos pelo Google (útil no log). */
  errorCodes?: string[];
  /** Pontuação (apenas reCAPTCHA v3; v2 não retorna). */
  score?: number;
}

/** Há uma chave secreta configurada no ambiente? */
export function isRecaptchaConfigured(): boolean {
  return Boolean((process.env.RECAPTCHA_SECRET_KEY ?? "").trim());
}

/**
 * Valida o token gerado pelo widget no cliente.
 *
 * @param token  valor de `g-recaptcha-response`
 * @param ip     IP do visitante (opcional; ajuda o Google a detectar abuso)
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  ip?: string
): Promise<RecaptchaResult> {
  const secret = (process.env.RECAPTCHA_SECRET_KEY ?? "").trim();

  // Sem chave secreta: não bloqueia o envio (modo não configurado).
  if (!secret) return { ok: true, skipped: true };

  const response = (token ?? "").trim();
  if (!response) {
    return { ok: false, skipped: false, errorCodes: ["missing-input-response"] };
  }

  const params = new URLSearchParams({ secret, response });
  if (ip) params.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    if (!res.ok) {
      return {
        ok: false,
        skipped: false,
        errorCodes: [`http-${res.status}`]
      };
    }

    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      "error-codes"?: string[];
    };

    if (!data.success) {
      console.warn(
        "reCAPTCHA recusado pelo Google:",
        data["error-codes"]?.join(", ") ?? "sem detalhes"
      );
    }

    return {
      ok: Boolean(data.success),
      skipped: false,
      score: data.score,
      errorCodes: data["error-codes"]
    };
  } catch (err) {
    console.error("Falha ao consultar a API do reCAPTCHA:", err);
    return { ok: false, skipped: false, errorCodes: ["verification-unavailable"] };
  }
}

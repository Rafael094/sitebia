import { NextResponse } from "next/server";

import { sendContactNotification } from "@/lib/mailer";
import { enforceContactRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Extrai o IP real do visitante tratando proxies/repetições de XFF. */
function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first.replace(/^::ffff:/, "");
  }
  return headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export interface ContactErrorBody {
  ok: false;
  error: string;
}

/**
 * POST /api/contact — recebe o formulário público e aplica:
 *   1) Validação de servidor;
 *   2) Anti-spam: Honeypot (website_sweet) — se preenchido responde 200 "ok" e
 *      não persiste NADA (nem grava nem envia e-mail);
 *   3) Rate limiting por IP (3/h) com HTTP 429;
 *   4) Persistência em contact_messages + envio SMTP para o destino configurado.
 */
export async function POST(request: Request) {
  const headers = request.headers;
  const ip = clientIp(headers);

  // Rejeita consumo de corpo acima de 64KB (defesa leve).
  const contentLength = Number(headers.get("content-length") ?? 0);
  if (contentLength > 65_536) {
    return NextResponse.json<ContactErrorBody>(
      { ok: false, error: "Requisição muito grande." },
      { status: 413 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json<ContactErrorBody>(
      { ok: false, error: "Requisição inválida." },
      { status: 400 }
    );
  }

  // --- Honeypot: robôs preenchem o campo invisível. Descartamos em silêncio. ---
  if (typeof body.website_sweet === "string" && body.website_sweet.trim()) {
    return NextResponse.json({ ok: true });
  }

  const str = (k: string) =>
    typeof body[k] === "string" ? (body[k] as string).trim() : "";
  const name = str("name");
  const email = str("email");
  const phone = str("phone");
  const subject = str("subject");
  const message = str("message");

  if (!name || name.length < 2) {
    return NextResponse.json<ContactErrorBody>(
      { ok: false, error: "Informe seu nome." },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json<ContactErrorBody>(
      { ok: false, error: "Informe um e-mail válido." },
      { status: 400 }
    );
  }
  if (message.length < 10) {
    return NextResponse.json<ContactErrorBody>(
      { ok: false, error: "Escreva uma mensagem com pelo menos 10 caracteres." },
      { status: 400 }
    );
  }

  // --- Rate limiting por IP (3/h) ---
  const limit = await enforceContactRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json<ContactErrorBody>(
      {
        ok: false,
        error: "Aguarde alguns minutos antes de enviar uma nova mensagem."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds)
        }
      }
    );
  }

  // --- Registra + dispara o e-mail (importa ao menos persistir) ---
  const { attempted, delivered } = await sendContactNotification({
    name,
    email,
    phone,
    subject,
    message
  });

  return NextResponse.json(
    { ok: true, error: null, email: { attempted, delivered } },
    { status: 200 }
  );
}

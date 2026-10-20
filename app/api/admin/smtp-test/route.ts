import { NextResponse } from "next/server";

import { sendTestEmail, verifySmtpConnection } from "@/lib/mailer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/smtp-test  → apenas diagnostica o ambiente (não envia nada)
 * POST /api/admin/smtp-test  → verifica o AUTH e envia um e-mail de teste
 *
 * Body (opcional): { to?: string }
 *
 * Protegida: exige sessão de administrador (cookie do Supabase Auth), pois
 * expõe host/porta/remetente usados pelo SMTP. Usada pelo botão
 * "Testar SMTP" em /admin/configuracoes.
 */
async function ensureAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 }
    );
  }

  const result = await verifySmtpConnection();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 }
    );
  }

  let body: { to?: unknown } = {};
  try {
    body = (await request.json()) as { to?: unknown };
  } catch {
    body = {};
  }

  const to = typeof body.to === "string" ? body.to.trim() : undefined;
  if (to && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json(
      { ok: false, error: "Informe um e-mail válido para o teste." },
      { status: 400 }
    );
  }

  const result = await sendTestEmail(to);
  return NextResponse.json(
    { ok: result.delivered, ...result },
    { status: result.delivered ? 200 : 502 }
  );
}

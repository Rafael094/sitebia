import { NextResponse } from "next/server";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/keep-alive
 * -----------------------------------------------------------------------
 * "Ping" leve que mantém o banco do Supabase ativo e evita a pausa por
 * inatividade do plano gratuito.
 *
 * Executa uma leitura trivial e barata (`select id limit 1`) em uma tabela
 * pequena e sempre presente. Qualquer query ao Postgres conta como atividade
 * para o Supabase — não importa se a tabela tem linhas.
 *
 * Disparado automaticamente pelo Vercel Cron (ver `vercel.json`).
 *
 * Segurança: quando a variável de ambiente `CRON_SECRET` está definida, a rota
 * passa a exigir o cabeçalho `Authorization: Bearer <CRON_SECRET>` (que o Vercel
 * Cron envia sozinho). Sem essa variável, a rota fica aberta para teste manual.
 *
 * 200: { ok: true, service: "supabase", checkedAt: "<ISO>" }
 * 401: { ok: false, error: "..." }   (segredo ausente/incorreto)
 * 503: { ok: false, error: "..." }   (falha ao consultar o banco)
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization")?.trim();
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    const admin = getAdminSupabaseClient();

    // Consulta mínima: acorda o banco sem custo relevante.
    // `services` é uma tabela central; caso não exista/vazia, o erro é tratado.
    const { error } = await admin.from("services").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Falha na consulta: ${error.message}` },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      service: "supabase",
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Falha ao contatar o Supabase."
      },
      { status: 503 }
    );
  }
}

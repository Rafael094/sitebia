import { NextResponse } from "next/server";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  classifyPath,
  hashVisitor,
  isTrackablePath,
  safeReferrerHost
} from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/view
 * -----------------------------------------------------------------------
 * Registra UMA visualização de página (Analytics / BI).
 *
 * O cliente (componente PageViewTracker) só envia a rota; o restante —
 * IP, User-Agent e Referer — é lido aqui, no servidor, para:
 *   1) Classificar o tipo de conteúdo (artigo, atuação, página…);
 *   2) ANONIMIZAR o visitante (hash SHA-256 — nunca guardamos o IP);
 *   3) Gravar na tabela `page_views` via service_role.
 *
 * Fire-and-forget: responde 204 rapidamente. Nunca lança erro para o site.
 *
 * Body: { path: string }
 * 204: registrado (ou ignorado silenciosamente)
 * 400: requisição inválida
 */
export async function POST(request: Request) {
  let path: string;
  try {
    const body = (await request.json()) as { path?: unknown };
    path = typeof body.path === "string" ? body.path : "";
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!isTrackablePath(path)) {
    // Painel, API, auth ou rota inválida: ignora sem erro.
    return new NextResponse(null, { status: 204 });
  }

  const headers = request.headers;
  const xff = headers.get("x-forwarded-for");
  const ip =
    (xff ? xff.split(",")[0].trim() : headers.get("x-real-ip")?.trim()) ||
    "127.0.0.1";
  const userAgent = headers.get("user-agent") ?? "";
  const referrer = safeReferrerHost(headers.get("referer"));

  const { contentType, slug } = classifyPath(path);
  const sessionHash = hashVisitor(ip, userAgent);

  try {
    const admin = getAdminSupabaseClient();

    // Enriquece com id/título do artigo ou serviço (melhora os relatórios).
    let contentId: string | null = null;
    let contentTitle: string | null = null;

    if (slug && (contentType === "artigo" || contentType === "atuacao")) {
      const table = contentType === "artigo" ? "articles" : "services";
      const { data } = await admin
        .from(table)
        .select("id, title")
        .eq("slug", slug)
        .maybeSingle();
      if (data) {
        contentId = (data as { id: string }).id;
        contentTitle = (data as { title: string }).title;
      }
    }

    await admin.from("page_views").insert({
      path,
      content_type: contentType,
      content_id: contentId,
      content_slug: slug,
      content_title: contentTitle,
      session_hash: sessionHash,
      referrer
    } as never);

    return new NextResponse(null, { status: 204 });
  } catch {
    // Falha de analytics nunca deve quebrar a navegação do visitante.
    return new NextResponse(null, { status: 204 });
  }
}

import { NextResponse } from "next/server";

import { generateSeoWithAi } from "@/lib/deepseek";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SeoRequestBody {
  title?: string;
  body?: string;
  kind?: string;
  context?: string;
}

/**
 * POST /api/admin/seo/generate
 * -----------------------------------------------------------------------
 * Gera metadados SEO (title/description/keywords + Open Graph) via DeepSeek
 * a partir do texto de um conteúdo. Não persiste — devolve o JSON para que o
 * painel (ou um gatilho de backend) decida como usar.
 *
 * Body: { title, body, kind?, context? }
 * 200:  { ok: true, seo: {...}, fromAi: boolean, warning?: string }
 * 400:  { ok: false, error: "..." }
 */
export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 512_000) {
    return NextResponse.json(
      { ok: false, error: "Conteúdo muito grande para otimização." },
      { status: 413 }
    );
  }

  let body: SeoRequestBody;
  try {
    body = (await request.json()) as SeoRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!title && !text) {
    return NextResponse.json(
      { ok: false, error: "Informe o título ou o conteúdo para gerar o SEO." },
      { status: 400 }
    );
  }

  const { seo, fromAi, warning } = await generateSeoWithAi({
    title,
    body: text,
    kind: body.kind,
    context: body.context
  });

  return NextResponse.json({ ok: true, seo, fromAi, warning: warning ?? null });
}

"use server";

// ============================================================================
// Geração de SEO com IA (DeepSeek) — Server Actions.
// Usadas pelo botão "Gerar com IA" dos formulários do painel e pelo
// gatilho automático nos fluxos de salvamento dos conteúdos.
// ============================================================================

import { generateSeoWithAi, type SeoSourceInput } from "@/lib/deepseek";
import { normalizeSeoMetadata, type SeoMetadata } from "@/lib/seo-types";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET } from "@/lib/constants";
import { randomId } from "@/lib/utils";
import type { PageSectionKey } from "@/lib/types";

/** Campos aceitos no corpo vindo do painel. */
export interface GenerateSeoPayload {
  title?: string;
  body?: string;
  kind?: string;
  context?: string;
  /** Chave da seção (quando o alvo é uma linha de page_contents). */
  sectionKey?: string;
}

export type GenerateSeoResult =
  | { ok: true; seo: SeoMetadata; fromAi: boolean; warning?: string }
  | { ok: false; error: string };

/**
 * Gera metadados SEO a partir de um texto livre — não persiste nada.
 * Usado pelo botão "Gerar com IA" (o admin revisa antes de salvar).
 */
export async function generateSeoAction(
  payload: GenerateSeoPayload
): Promise<GenerateSeoResult> {
  const title = String(payload?.title ?? "").trim();
  const body = String(payload?.body ?? "").trim();
  if (!title && !body) {
    return { ok: false, error: "Informe o título ou o conteúdo antes de gerar o SEO." };
  }

  const input: SeoSourceInput = {
    title,
    body,
    kind: payload.kind,
    context: payload.context
  };

  try {
    const { seo, fromAi, warning } = await generateSeoWithAi(input);
    return { ok: true, seo, fromAi, warning };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Falha ao gerar os metadados de SEO."
    };
  }
}

// ===========================================================================
// Gatilho automático (chamado pelos fluxos de criação/edição)
// ===========================================================================

/** Conteúdo mínimo necessário para decidir se vale acionar a IA. */
export interface AutoSeoInput {
  title: string;
  body: string;
  kind?: string;
  context?: string;
  /** SEO já preenchido manualmente no formulário. */
  current?: SeoMetadata;
  /** Quando `true`, regenera mesmo que já exista SEO salvo. */
  force?: boolean;
}

/**
 * Decide e executa a geração automática.
 * Estratégia (alta performance, sem gastar tokens à toa):
 *   - se já há meta_title E meta_description e `force` não veio ⇒ mantém;
 *   - só aciona a IA quando falta informação essencial.
 */
export async function resolveAutoSeo(
  input: AutoSeoInput
): Promise<{ seo: SeoMetadata; fromAi: boolean; warning?: string }> {
  const current = normalizeSeoMetadata(input.current);
  const hasEnough = Boolean(current.meta_title && current.meta_description);

  if (hasEnough && !input.force) {
    return { seo: current, fromAi: false };
  }

  const { seo, fromAi, warning } = await generateSeoWithAi({
    title: input.title,
    body: input.body,
    kind: input.kind,
    context: input.context
  });

  // Preserva o que o admin escreveu à mão e completa apenas o que faltou.
  const merged: SeoMetadata = {
    ...seo,
    ...current,
    meta_title: current.meta_title || seo.meta_title,
    meta_description: current.meta_description || seo.meta_description,
    meta_keywords: current.meta_keywords || seo.meta_keywords,
    og_title: current.og_title || current.meta_title || seo.og_title,
    og_description:
      current.og_description || current.meta_description || seo.og_description,
    source: fromAi ? (current.meta_title ? "manual" : "ai") : "auto"
  };

  return { seo: merged, fromAi, warning };
}

/** Lê o seo_metadata salvo de uma linha de page_contents. */
export async function getSectionSeo(sectionKey: PageSectionKey): Promise<SeoMetadata> {
  try {
    const admin = getAdminSupabaseClient();
    const { data } = await admin
      .from("page_contents")
      .select("seo_metadata" as never)
      .eq("section_key", sectionKey)
      .maybeSingle();
    const row = data as { seo_metadata?: unknown } | null;
    return normalizeSeoMetadata(row?.seo_metadata);
  } catch {
    return {};
  }
}

// ===========================================================================
// Upload da imagem Open Graph (og_image) para o Supabase Storage
// ===========================================================================

export type UploadOgImageResult = { ok: true; url: string } | { ok: false; error: string };

const OG_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Envia uma imagem de compartilhamento (Open Graph) para o bucket público
 * `uploads` (pasta `og`) e devolve a URL pública.
 * Mesmo padrão usado no upload da capa de artigo e da imagem de seção —
 * o admin nunca precisa digitar uma URL manualmente.
 */
export async function uploadOgImage(rawFile: File): Promise<UploadOgImageResult> {
  if (!(rawFile instanceof File) || rawFile.size === 0) {
    return { ok: false, error: "Nenhum arquivo de imagem enviado." };
  }
  if (rawFile.size > OG_MAX_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 5 MB." };
  }
  if (!rawFile.type.startsWith("image/")) {
    return { ok: false, error: "Envie um arquivo de imagem válido (PNG, JPG, WEBP…)." };
  }

  try {
    const bytes = Buffer.from(await rawFile.arrayBuffer());
    const ext = (rawFile.name.split(".").pop() || "png").toLowerCase();
    const folder = "og";
    const fileName = `${Date.now()}-${randomId(8)}.${ext}`;

    const admin = getAdminSupabaseClient();
    const { error } = await admin.storage
      .from(UPLOADS_BUCKET)
      .upload(`${folder}/${fileName}`, bytes, {
        contentType: rawFile.type,
        upsert: false
      });

    if (error) return { ok: false, error: error.message };

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return {
      ok: true,
      url: `${base}/storage/v1/object/public/${UPLOADS_BUCKET}/${folder}/${fileName}`
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Falha ao enviar a imagem."
    };
  }
}

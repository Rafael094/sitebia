"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET } from "@/lib/constants";
import {
  PAGE_SECTION_KEYS,
  RICH_FIELDS,
  mergePageContentRow
} from "@/lib/page-content";
import { sanitizeRichHtml } from "@/lib/rich-html";
import { readSeoFromFormData } from "@/lib/seo-form";
import { normalizeSeoMetadata } from "@/lib/seo-types";
import { resolveAutoSeo } from "@/server/seo-admin";
import { randomId } from "@/lib/utils";
import type { PageContent, PageSectionKey } from "@/lib/types";

/** Campos textuais simples (gravados uma linha única, sem quebra de parágrafo). */
const PLAIN_FIELDS: (keyof PageContent)[] = [
  "badge_text",
  "title",
  "subtitle",
  "button_primary_label",
  "button_primary_url",
  "button_secondary_label",
  "button_secondary_url",
  "badge_extra_title",
  "badge_extra_sub",
  "image_url",
  "academic_title"
];

/**
 * Retorna para o painel cada seção já com o padrão mesclado (nunca nulo),
 * na ordem fixa de PAGE_SECTION_KEYS.
 */
export async function listAdminSections(): Promise<
  { key: PageSectionKey; content: PageContent }[]
> {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("page_contents")
    .select("*");
  if (error) throw error;

  const map: Record<string, Partial<PageContent>> = {};
  for (const r of data ?? []) {
    const row = r as Partial<PageContent>;
    map[row.section_key as string] = row;
  }

  return PAGE_SECTION_KEYS.map((key) => ({
    key,
    content: mergePageContentRow(key, map[key])
  }));
}

export type SectionSaveResult = { ok: true } | { ok: false; error: string };

/**
 * Envia uma imagem do painel para a pasta pública de uploads (Supabase Storage)
 * e devolve a URL pública relativa/absoluta que será gravada em image_url.
 */
async function uploadSectionImage(rawFile: File): Promise<string> {
  const bytes = Buffer.from(await rawFile.arrayBuffer());
  const ext = (rawFile.name.split(".").pop() || "png").toLowerCase();
  const folder = "sections";
  const fileName = `${Date.now()}-${randomId(8)}.${ext}`;

  const admin = getAdminSupabaseClient();
  const { error } = await admin.storage
    .from(UPLOADS_BUCKET)
    .upload(`${folder}/${fileName}`, bytes, { contentType: rawFile.type });

  if (error) throw new Error(error.message);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${UPLOADS_BUCKET}/${folder}/${fileName}`;
}

/** Grava (upsert pelo section_key) o conteúdo editado de uma seção. */
export async function saveSectionContentAction(
  formData: FormData
): Promise<SectionSaveResult> {
  const keyRaw = (formData.get("section_key")?.toString() ?? "").trim();
  if (!PAGE_SECTION_KEYS.includes(keyRaw as PageSectionKey)) {
    return { ok: false, error: "Seção inválida." };
  }
  const key = keyRaw as PageSectionKey;

  const textOf = (name: string) => (formData.get(name)?.toString() ?? "").trim();

  // Campos ricos passam por sanitizador (mantém negrito/parágrafos, remove scripts).
  const richValues: Record<string, string> = {};
  for (const f of RICH_FIELDS) {
    const name = f as string;
    const raw = (formData.get(name)?.toString() ?? "").trim();
    richValues[f] = raw ? sanitizeRichHtml(raw) : "";
  }

  const plainValues: Record<string, string> = {};
  for (const f of PLAIN_FIELDS) {
    const name = f as string;
    // keeps literal newlines out of single-line fields
    plainValues[f] = textOf(name);
  }

  // Arquivo de imagem do Hero (input type="file" name="IMAGE_FILE"):
  // quando enviado, substitui a antiga string de URL estática pelo caminho
  // salvo na pasta pública de uploads. Sem arquivo, mantém o valor atual.
  const imageFile = formData.get("IMAGE_FILE");
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 5 * 1024 * 1024) {
      return { ok: false, error: "A imagem deve ter no máximo 5 MB." };
    }
    if (!imageFile.type.startsWith("image/")) {
      return { ok: false, error: "Envie um arquivo de imagem válido." };
    }
    try {
      plainValues.image_url = await uploadSectionImage(imageFile);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Falha ao enviar a imagem."
      };
    }
  }

  const payload = {
    section_key: key,
    ...plainValues,
    ...richValues
  } as Partial<PageContent>;

  const admin = getAdminSupabaseClient();

  // --- SEO editável (DeepSeek) ---------------------------------------------
  // 1) Lê o que o admin preencheu no painel;
  // 2) Se nada foi informado, aciona a IA automaticamente com o texto da seção.
  const manualSeo = readSeoFromFormData(formData);
  const sectionText =
    richValues.description ||
    plainValues.description ||
    plainValues.subtitle ||
    plainValues.title ||
    "";

  if (manualSeo.meta_title || manualSeo.meta_description) {
    // Admin assumiu o controle — grava exatamente o que ele escreveu.
    payload.seo_metadata = { ...manualSeo, source: "manual" };
  } else {
    const existing = await admin
      .from("page_contents")
      .select("seo_metadata" as never)
      .eq("section_key", key)
      .maybeSingle();
    const current = normalizeSeoMetadata(
      (existing.data as { seo_metadata?: unknown } | null)?.seo_metadata
    );

    if (current.meta_title && current.meta_description) {
      payload.seo_metadata = current; // nada a fazer: já otimizado
    } else {
      const { seo } = await resolveAutoSeo({
        title: plainValues.title || key,
        body: sectionText,
        kind: `Seção do site (${key})`,
        context: "/",
        current
      });
      payload.seo_metadata = seo;
    }
  }

  const { error } = await admin
    .from("page_contents")
    .upsert([{ ...payload } as never], { onConflict: "section_key" });

  if (error) return { ok: false, error: error.message };

  // Revalida o site público (Home, páginas internas) que consome page_contents.
  revalidatePath("/", "layout");
  return { ok: true };
}


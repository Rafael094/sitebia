"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  PAGE_SECTION_KEYS,
  RICH_FIELDS,
  mergePageContentRow
} from "@/lib/page-content";
import { sanitizeRichHtml } from "@/lib/rich-html";
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
  "image_url"
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

  const payload = {
    section_key: key,
    ...plainValues,
    ...richValues
  } as Partial<PageContent>;

  const admin = getAdminSupabaseClient();
  const { error } = await admin
    .from("page_contents")
    .upsert([{ ...payload } as never], { onConflict: "section_key" });

  if (error) return { ok: false, error: error.message };

  // Revalida o site público (Home, páginas internas) que consome page_contents.
  revalidatePath("/", "layout");
  return { ok: true };
}


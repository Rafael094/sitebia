"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  contactLinksToSettingsRow,
  siteSettingsToContactLinks
} from "@/lib/settings";
import type { SiteContactLinks, SiteSettings } from "@/lib/types";

/** Canais já salvos no banco (ou null quando ainda não configurados). */
export async function getStoredContactChannels(): Promise<SiteContactLinks | null> {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("site_settings")
    .select("whatsapp_link, contact_email, instagram_link, linkedin_link")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return siteSettingsToContactLinks(data as unknown as Partial<SiteSettings>);
}

export type SettingsSaveResult =
  | { ok: true }
  | { ok: false; error: string };

/** Grava (ou cria a linha única) dos canais públicos editáveis pelo painel. */
export async function saveContactChannelSettingsAction(
  formData: FormData
): Promise<SettingsSaveResult> {
  const fieldOf = (name: string) =>
    (formData.get(name)?.toString() ?? "").trim();

  const draft: SiteContactLinks = {
    whatsapp: fieldOf("whatsapp"),
    email: fieldOf("contact_email"),
    instagram: fieldOf("instagram"),
    linkedin: fieldOf("linkedin")
  };

  const blank = Object.entries(draft).find(([, value]) => !value);
  if (blank) {
    return { ok: false, error: "Preencha todos os canais de contato." };
  }

  const row = {
    id: 1,
    ...contactLinksToSettingsRow(draft)
  };

  const admin = getAdminSupabaseClient();
  const { error } = await admin
    .from("site_settings")
    .upsert([row as unknown as never], { onConflict: "id" });
  if (error) return { ok: false, error: error.message };

  // Atualiza o cache das páginas públicas que mostram os canais novos.
  revalidatePath("/", "layout");
  return { ok: true };
}

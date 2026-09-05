"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * E-mail de DESTINO atualmente configurado (site_settings.contact_recipient_email)
 * para receber as mensagens do formulário de contato via SMTP.
 */
export async function getStoredNotifyRecipient(): Promise<string> {
  try {
    const admin = getAdminSupabaseClient();
    const { data, error } = await admin
      .from("site_settings")
      .select("contact_recipient_email")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return "";
    const row = data as { contact_recipient_email?: string | null };
    return row.contact_recipient_email?.trim() ?? "";
  } catch {
    return "";
  }
}

export type EmailSettingsResult = { ok: true } | { ok: false; error: string };

/** Grava o e-mail de destino das notificações pela tela /admin/configuracoes. */
export async function saveNotifyRecipientAction(
  formData: FormData
): Promise<EmailSettingsResult> {
  const value = (formData.get("recipient_email")?.toString() ?? "").trim();
  if (value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    return { ok: false, error: "Informe um e-mail de destino válido." };
  }

  const admin = getAdminSupabaseClient();
  const { error } = await admin
    .from("site_settings")
    .upsert([{ id: 1, contact_recipient_email: value } as never], {
      onConflict: "id"
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

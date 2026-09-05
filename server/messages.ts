"use server";

import { revalidatePath } from "next/cache";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";

/** Lista todas as mensagens de contato com suporte a paginação simples. */
export async function listMessages() {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Marca uma mensagem como lida/não lida. */
export async function setMessageRead(id: string, read: boolean) {
  const admin = getAdminSupabaseClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ is_read: read } as unknown as never)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/mensagens");
}

/** Remove uma mensagem de contato. */
export async function deleteMessage(id: string) {
  const admin = getAdminSupabaseClient();
  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mensagens");
}

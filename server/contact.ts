"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server Action responsável por gravar as mensagens vindas do formulário de
 * contato público. A política de RLS permite INSERT inclusive para visitantes
 * não autenticados.
 */
export async function submitContactMessage(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const subject = (formData.get("subject") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim();

  // Validação básica no servidor.
  if (!name || name.length < 2) {
    return { ok: false, error: "Informe seu nome." };
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (!message || message.length < 10) {
    return { ok: false, error: "Escreva uma mensagem com pelo menos 10 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, subject, message } as unknown as never[]);

  if (error) {
    return {
      ok: false,
      error: "Não foi possível enviar a mensagem agora. Tente novamente em instantes."
    };
  }

  return { ok: true, error: null as string | null };
}

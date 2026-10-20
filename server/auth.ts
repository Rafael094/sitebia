"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifyRecaptcha } from "@/lib/recaptcha";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Realiza o login (função nativa do Supabase Auth — email/senha). */
export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Proteção contra força bruta (ativa quando RECAPTCHA_SECRET_KEY existe).
  const recaptcha = await verifyRecaptcha(
    String(formData.get("recaptchaToken") ?? "")
  );
  if (!recaptcha.ok) {
    return {
      ok: false,
      error:
        "Não foi possível validar o reCAPTCHA. Atualize a página e tente novamente."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Credenciais inválidas. Verifique e-mail e senha." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/dashboard");
}

/** Encerra a sessão do usuário autenticado. */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

/** Retorna o usuário atual (usado para proteção de páginas em Server Components). */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

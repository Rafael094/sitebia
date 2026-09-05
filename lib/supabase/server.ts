import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/types";

/**
 * Cliente Supabase executado no SERVIDOR (Server Components, Server Actions e
 * Route Handlers), preparado para trabalhar com o sistema de cookies do Next.
 *
 * Le e atualiza o cookie de sessão a cada requisição — fundamental para
 * autenticação do painel administrativo.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("As variáveis de ambiente do Supabase não estão configuradas.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado a partir de um Server Component. Pode ser ignorado com
          // segurança quando usado dentro de Server Actions/Route Handlers.
        }
      }
    }
  });
}

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Cliente ADMIN (service_role), exclusivamente PARA SERVIDOR.
 * Ignora as políticas de RLS — use somente em Server Actions / Route Handlers
 * e JAMAIS exponha esta chave ao navegador.
 */
export function getAdminSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.");
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}

import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export const RATE_LIMIT_LIMIT = 3; // envios permitidos por janela
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/**
 * Rate limiting de contato por IP — 3 envios por hora, sem depender de
 * serviços externos. Usa a tabela contact_rate_limits (row locking implícito
 * via upsert). Em desenvolvimento/ausência de service_role usa um fallback em
 * memória para nunca bloquear o fluxo local indevidamente.
 */
export async function enforceContactRateLimit(
  ip: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);

  try {
    const admin = getAdminSupabaseClient();

    const { data } = await admin
      .from("contact_rate_limits")
      .select("window_start, count")
      .eq("ip", ip)
      .maybeSingle();

    const existing = data as { window_start: string; count: number } | null;
    const windowStart = existing
      ? new Date(existing.window_start).getTime()
      : hourStart.getTime();

    // Janela expirada => reinicia a contagem.
    if (now - windowStart >= RATE_LIMIT_WINDOW_MS) {
      await admin
        .from("contact_rate_limits")
        .upsert(
          { ip, count: 1, window_start: hourStart.toISOString() } as never,
          { onConflict: "ip" }
        );
      return { ok: true, remaining: RATE_LIMIT_LIMIT - 1 };
    }

    if (existing) {
      if (existing.count >= RATE_LIMIT_LIMIT) {
        const waitMs = Math.max(
          1,
          Math.ceil((RATE_LIMIT_WINDOW_MS - (now - windowStart)) / 1000)
        );
        return { ok: false, retryAfterSeconds: waitMs };
      }
      const next = existing.count + 1;
      await admin
        .from("contact_rate_limits")
        .upsert({ ip, count: next } as never, { onConflict: "ip" });
      return { ok: true, remaining: RATE_LIMIT_LIMIT - next };
    }

    // Primeiro acesso nesta janela.
    await admin
      .from("contact_rate_limits")
      .insert({ ip, count: 1, window_start: hourStart.toISOString() } as never);
    return { ok: true, remaining: RATE_LIMIT_LIMIT - 1 };
  } catch {
    // Fallback em memória (desenvolvimento sem service role no ambiente).
    return inMemoryEnforce(ip);
  }
}

// ----------------------------------------------------------------------------
// Fallback em memória (não compartilhado entre instâncias — só p/ dev/testes).
// ----------------------------------------------------------------------------
const memory = new Map<string, { windowStart: number; count: number }>();

function inMemoryEnforce(ip: string): RateLimitResult {
  const now = Date.now();
  const hit = memory.get(ip);

  if (!hit || now - hit.windowStart >= RATE_LIMIT_WINDOW_MS) {
    memory.set(ip, { windowStart: now, count: 1 });
    return { ok: true, remaining: RATE_LIMIT_LIMIT - 1 };
  }

  if (hit.count >= RATE_LIMIT_LIMIT) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil(
        (RATE_LIMIT_WINDOW_MS - (now - hit.windowStart)) / 1000
      )
    };
  }

  hit.count += 1;
  return { ok: true, remaining: RATE_LIMIT_LIMIT - hit.count };
}

import { DEFAULT_CONTACT_CHANNELS } from "@/lib/constants";
import type { SiteContactLinks, SiteSettings } from "@/lib/types";

/**
 * Normaliza a linha única de "site_settings" (ou a ausência dela) em um objeto
 * de canais completos — nunca retorna campos vazios.
 */
export function siteSettingsToContactLinks(
  row?: Partial<SiteSettings> | null
): SiteContactLinks {
  const defaults = DEFAULT_CONTACT_CHANNELS;
  const value = (v?: string | null) => v?.trim() || "";
  return {
    whatsapp: value(row?.whatsapp_link) || defaults.whatsapp,
    email: value(row?.contact_email) || defaults.email,
    instagram: value(row?.instagram_link) || defaults.instagram,
    linkedin: value(row?.linkedin_link) || defaults.linkedin,
    address: value(row?.contact_address) || defaults.address,
    hours: value(row?.contact_hours) || defaults.hours
  };
}

/** Converte canais em colunas da tabela (para INSERT/UPDATE do painel). */
export function contactLinksToSettingsRow(
  links: SiteContactLinks
): Pick<
  SiteSettings,
  | "whatsapp_link"
  | "contact_email"
  | "instagram_link"
  | "linkedin_link"
  | "contact_address"
  | "contact_hours"
> {
  return {
    whatsapp_link: links.whatsapp.trim(),
    contact_email: links.email.trim(),
    instagram_link: links.instagram.trim(),
    linkedin_link: links.linkedin.trim(),
    contact_address: links.address.trim(),
    contact_hours: links.hours.trim()
  };
}

/**
 * Busca os canais salvos no Supabase para o site público.
 * Se o banco estiver indisponível (ou a linha ainda não existir), retorna os
 * valores padrão — nunca quebra a renderização do site.
 */
export async function getPublicContactChannels(): Promise<SiteContactLinks> {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "whatsapp_link, contact_email, instagram_link, linkedin_link, contact_address, contact_hours"
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return siteSettingsToContactLinks(data);
  } catch {
    return siteSettingsToContactLinks(null);
  }
}


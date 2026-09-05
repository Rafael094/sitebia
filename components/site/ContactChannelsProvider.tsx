"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_CONTACT_CHANNELS } from "@/lib/constants";
import type { SiteContactLinks } from "@/lib/types";

/**
 * Disponibiliza os canais de contato (lidos no servidor a partir do Supabase)
 * para componentes clientes do site — rodapé, botão flutuante, CTAs etc.
 */
const ContactChannelsContext = createContext<SiteContactLinks>(
  DEFAULT_CONTACT_CHANNELS
);

export function ContactChannelsProvider({
  channels = DEFAULT_CONTACT_CHANNELS,
  children
}: {
  channels?: SiteContactLinks;
  children: ReactNode;
}) {
  return (
    <ContactChannelsContext.Provider value={channels}>
      {children}
    </ContactChannelsContext.Provider>
  );
}

export function useContactChannels(): SiteContactLinks {
  return useContext(ContactChannelsContext);
}

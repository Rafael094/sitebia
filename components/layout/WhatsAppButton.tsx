"use client";

import { usePathname } from "next/navigation";

import { useContactChannels } from "@/components/site/ContactChannelsProvider";
import { whatsappSvgPath } from "@/components/icons/whatsapp-icon";

/**
 * Botão flutuante do WhatsApp, fixo no canto inferior direito.
 * Oculta-se nas rotas do painel administrativo.
 */
export default function WhatsAppButton({
  message = "Olá! Vim pelo site e gostaria de conhecer os serviços de Bianca Martins."
}: {
  message?: string;
}) {
  const pathname = usePathname();
  const contact = useContactChannels();
  if (pathname?.startsWith("/admin")) return null;

  const href = `${contact.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d={whatsappSvgPath} />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-sm bg-navy-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        Fale comigo no WhatsApp
      </span>
    </a>
  );
}

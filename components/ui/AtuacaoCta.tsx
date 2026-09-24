"use client";

import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";

import { useContactChannels } from "@/components/site/ContactChannelsProvider";
import { useSectionContent } from "@/components/site/SectionsProvider";

/** CTA final da página /atuacao — integrado ao tema escuro. */
export default function AtuacaoCta() {
  const contact = useContactChannels();
  const c = useSectionContent("home_cta");

  const title =
    c.title ||
    "Pronta para estruturar a proteção e a transferência da sua tecnologia?";
  const text =
    c.description ||
    "Vamos conversar sobre o seu caso em um diagnóstico inicial — sem compromisso.";
  const buttonLabel = c.button_primary_label || "Agendar uma conversa";
  const buttonUrl =
    c.button_primary_url && c.button_primary_url.trim()
      ? c.button_primary_url
      : "/contato";
  const secondaryLabel = c.button_secondary_label || "WhatsApp direto";

  return (
    <div className="container-site relative mt-20">
      <div className="rounded-xl border border-amber-500/20 bg-navy-800/40 px-6 py-12 text-center backdrop-blur-md sm:px-12">
        <h2 className="mx-auto max-w-2xl font-display text-2xl font-normal uppercase text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={buttonUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-medium text-navy-950 transition-colors hover:bg-amber-400"
          >
            <CalendarCheck className="h-4 w-4" /> {buttonLabel}
          </Link>
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
          >
            <Phone className="h-4 w-4" /> {secondaryLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

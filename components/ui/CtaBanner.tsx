"use client";

import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";

import { useContactChannels } from "@/components/site/ContactChannelsProvider";

/** Chamada para ação institucional usada ao fim de seções e páginas internas. */
export default function CtaBanner({
  title = "Pronta para estruturar a proteção e a transferência da sua tecnologia?",
  text = "Vamos conversar sobre o seu caso em um diagnóstico inicial — sem compromisso.",
  buttonLabel = "Agendar uma conversa"
}: {
  title?: string;
  text?: string;
  buttonLabel?: string;
}) {
  const contact = useContactChannels();
  return (
    <section className="py-16">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-md bg-navy-900 px-6 py-12 text-center sm:px-12">
          {/* brilho decorativo dourado */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-navy-700 blur-2xl" />

          <h2 className="relative mx-auto max-w-2xl font-display text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-ivory-100/70">
            {text}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contato" className="btn-gold">
              <CalendarCheck className="h-4 w-4" /> {buttonLabel}
            </Link>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !border-ivory-100/40 !text-white hover:!bg-white hover:!text-navy-900"
            >
              <Phone className="h-4 w-4" /> WhatsApp direto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

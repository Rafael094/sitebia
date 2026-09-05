"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, Instagram, Linkedin, Phone } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { useContactChannels } from "@/components/site/ContactChannelsProvider";
import { NAV_LINKS, SITE } from "@/lib/constants";

/** Rodapé institucional. Oculta-se em rotas do painel administrativo. */
export default function Footer() {
  const pathname = usePathname();
  const contact = useContactChannels();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-navy-900 text-ivory-100">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div className="sm:col-span-2 lg:col-span-1">
          {/* Logo reverso */}
          <div className="[--orbit:#C5A059] [--mono:#fff]">
            <Logo variant="light" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory-200/70">
            {SITE.description}
          </p>
        </div>

        {/* Navegação */}
        <nav aria-label="Rodapé">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
            Navegação
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ivory-200/80 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Atuação resumida */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
            Atuação
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory-200/80">
            <li>Diagnóstico de Propriedade Intelectual</li>
            <li>Estruturação de Portfólio</li>
            <li>Conexão Pesquisa &amp; Mercado</li>
            <li>Contratos de Tecnologia</li>
          </ul>
          <Link
            href="/atuacao"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            Ver todos os serviços <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Contato direto */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
            Contato
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 text-ivory-200/80 hover:text-white"
              >
                <Mail className="h-4 w-4 text-gold-400" /> {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ivory-200/80 hover:text-white"
              >
                <Phone className="h-4 w-4 text-gold-400" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ivory-200/80 hover:text-white"
              >
                <Instagram className="h-4 w-4 text-gold-400" /> Instagram
              </a>
            </li>
            <li>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ivory-200/80 hover:text-white"
              >
                <Linkedin className="h-4 w-4 text-gold-400" /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory-200/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Bianca Martins. Todos os direitos reservados.</p>
          <p>Transferência de Tecnologia &amp; Propriedade Intelectual</p>
        </div>
      </div>
    </footer>
  );
}

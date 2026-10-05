"use client";

import { Clock, Globe2, Mail, MessageCircle } from "lucide-react";

import IntlContactForm from "@/components/international/IntlContactForm";
import { useContactChannels } from "@/components/site/ContactChannelsProvider";

/**
 * Bloco de contato da landing internacional (id="contact").
 * Reaproveita os canais diretos editáveis no painel e o formulário integrado
 * à API existente (/api/contact).
 */
export default function IntlContactSection() {
  const contact = useContactChannels();

  return (
    <section
      id="contact"
      data-header-theme="light"
      className="scroll-mt-24 bg-ivory-100 pb-20 pt-4"
    >
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="section-eyebrow">Get in touch</p>
            <h2 className="section-title">Talk to Bianca</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-600">
              Share a few details about your objectives in Brazil. We will
              respond with a clear, practical view of the next steps for your
              intellectual property, market-entry or innovation needs.
            </p>
            <div className="mt-8">
              <IntlContactForm />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Direct channels
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    data-analytics="intl_click_email"
                    className="group flex items-center gap-3 rounded-sm border border-navy-800/10 p-3 transition hover:border-gold-500"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold-500/10 text-gold-600">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-navy-400">
                        E-mail
                      </span>
                      <span className="block truncate font-medium text-navy-800 group-hover:text-navy-700">
                        {contact.email}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="intl_click_whatsapp"
                    className="group flex items-center gap-3 rounded-sm border border-navy-800/10 p-3 transition hover:border-gold-500"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold-500/10 text-gold-600">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-navy-400">
                        WhatsApp
                      </span>
                      <span className="block truncate font-medium text-navy-800 group-hover:text-navy-700">
                        Start a conversation
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="card space-y-4 p-6 text-sm text-navy-700">
              <p className="flex items-start gap-3">
                <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                Based in Brazil — working across borders and time zones.
              </p>
              <p className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                {contact.hours}
              </p>
            </div>

            <div className="rounded-md bg-navy-900 p-6 text-ivory-100">
              <p className="font-display text-lg font-semibold">
                International law firms
              </p>
              <p className="mt-2 text-sm text-ivory-200/80">
                Need reliable Brazilian support for your clients? Mention your
                firm in the message and we will coordinate directly with you.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

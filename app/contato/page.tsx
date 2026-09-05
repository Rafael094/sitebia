import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Linkedin, Instagram } from "lucide-react";

import type { SiteContactLinks } from "@/lib/types";
import { getPublicContactChannels } from "@/lib/settings";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/home/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com Bianca Martins para consultoria em transferência de tecnologia e propriedade intelectual."
};

const buildChannels = (contact: SiteContactLinks) => [
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: contact.whatsapp,
    href: contact.whatsapp,
    external: true
  },
  {
    Icon: Mail,
    label: "E-mail",
    value: contact.email,
    href: `mailto:${contact.email}`,
    external: false
  },
  {
    Icon: Linkedin,
    label: "LinkedIn",
    value: "Bianca Martins",
    href: contact.linkedin,
    external: true
  },
  {
    Icon: Instagram,
    label: "Instagram",
    value: "@biancamartins",
    href: contact.instagram,
    external: true
  }
];

export default async function ContatoPage() {
  const contact = await getPublicContactChannels();
  const channels = buildChannels(contact);
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Vamos conversar sobre a sua tecnologia?"
        description="Conte um pouco sobre o seu projeto, inovação ou parceria. Responderei com a escuta e a objetividade de quem vive a interface pesquisa–mercado todos os dias."
      />

      <section className="container-site pb-20 pt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Formulário */}
          <div>
            <ContactForm />
          </div>

          {/* Canais diretos */}
          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-navy-900">Canais diretos</h2>
              <ul className="mt-4 space-y-3">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-3 rounded-sm border border-navy-800/10 p-3 transition hover:border-gold-500"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold-500/10 text-gold-600">
                        <c.Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-navy-400">
                          {c.label}
                        </span>
                        <span className="block truncate font-medium text-navy-800 group-hover:text-navy-700">
                          {c.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4 p-6 text-sm text-navy-700">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                São Paulo — SP, Brasil & atendimento remoto para todo o país
              </p>
              <p className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                Segunda a sexta, das 9h às 18h (horário de Brasília)
              </p>
            </div>

            <div className="rounded-md bg-navy-900 p-6 text-ivory-100">
              <p className="font-display text-lg font-semibold">Prefere agendar?</p>
              <p className="mt-2 text-sm text-ivory-200/80">
                Em sua mensagem, mencione disponibilidade de horário — combinamos uma reunião inicial sem compromisso.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

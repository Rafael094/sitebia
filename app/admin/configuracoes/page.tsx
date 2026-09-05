import { Bell, Clock, Link2, Mail, MapPin, MessageCircle, AtSign, Briefcase } from "lucide-react";

import ContactChannelsSettingsForm from "@/components/admin/ContactChannelsSettingsForm";
import EmailNotificationsForm from "@/components/admin/EmailNotificationsForm";
import { DEFAULT_CONTACT_CHANNELS } from "@/lib/constants";
import { getStoredContactChannels } from "@/server/site-settings";
import { getStoredNotifyRecipient } from "@/server/email-notify";

export const metadata = { title: "Configurações do Site", robots: { index: false } };

export default async function SiteConfigPage() {
  let saved = DEFAULT_CONTACT_CHANNELS;
  try {
    saved = (await getStoredContactChannels()) ?? saved;
  } catch {
    // Sem conexão com o Supabase vamos simplesmente pré-exibir os padrões.
  }

  let notifyRecipient = "";
  try {
    notifyRecipient = await getStoredNotifyRecipient();
  } catch {
    notifyRecipient = "";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Configurações do site
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Dados de contato exibidos no site público. Guarde-os na linha única de
          configuração e o rodapé, o botão do WhatsApp, os CTAs e a página
          “Contato” passam a usar o que você salvar aqui.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-navy-800/10 pb-4 text-sm text-navy-600">
          <p className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">WhatsApp</strong>{" "}
              {saved.whatsapp}
            </span>
          </p>
          <p className="inline-flex items-center gap-2">
            <AtSign className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">E-mail</strong> {saved.email}
            </span>
          </p>
          <p className="inline-flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">Instagram</strong>{" "}
              {saved.instagram}
            </span>
          </p>
          <p className="inline-flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">LinkedIn</strong>{" "}
              {saved.linkedin}
            </span>
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">Endereço</strong>{" "}
              {saved.address}
            </span>
          </p>
          <p className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">Horário</strong> {saved.hours}
            </span>
          </p>
        </div>

        <ContactChannelsSettingsForm initial={saved} />
      </div>

      {/* Notificações por e-mail (SMTP + destino) */}
      <div className="card p-6">
        <div className="flex items-center gap-3 pb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-gold-500/10 text-gold-600">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              E-mail de notificação
            </h2>
            <p className="text-sm text-navy-500">
              Caixa que recebe os contatos enviados pelo formulário do site.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-b border-navy-800/10 pb-4 text-sm text-navy-600">
          <p className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold-600" />
            <span>
              <strong className="block text-navy-800">Destinatário atual</strong>{" "}
              {notifyRecipient || saved.email}
            </span>
          </p>
        </div>

        <div className="mt-4">
          <EmailNotificationsForm initial={notifyRecipient} />
        </div>
      </div>
    </div>
  );
}

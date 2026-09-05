import { Link2, MessageCircle, AtSign, Briefcase } from "lucide-react";

import ContactChannelsSettingsForm from "@/components/admin/ContactChannelsSettingsForm";
import { DEFAULT_CONTACT_CHANNELS } from "@/lib/constants";
import { getStoredContactChannels } from "@/server/site-settings";

export const metadata = { title: "Configurações do Site", robots: { index: false } };

export default async function SiteConfigPage() {
  let saved = DEFAULT_CONTACT_CHANNELS;
  try {
    saved = (await getStoredContactChannels()) ?? saved;
  } catch {
    // Sem conexão com o Supabase vamos simplesmente pré-exibir os padrões.
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
        </div>

        <ContactChannelsSettingsForm initial={saved} />
      </div>
    </div>
  );
}

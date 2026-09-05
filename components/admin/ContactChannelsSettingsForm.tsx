"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, MessagesSquare, Save, ExternalLink } from "lucide-react";

import { saveContactChannelSettingsAction } from "@/server/site-settings";
import type { SiteContactLinks } from "@/lib/types";

/**
 * Formulário que torna os canais de contato do site editáveis pelo painel.
 * Os dados aparecem no rodapé, no botão flutuante do WhatsApp, nos CTAs e na
 * página pública /contato.
 */
export default function ContactChannelsSettingsForm({
  initial
}: {
  initial: SiteContactLinks;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "success" }
  >({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    const fd = new FormData(e.currentTarget);
    const result = await saveContactChannelSettingsAction(fd);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({ kind: "success" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status.kind === "error" && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </p>
      )}
      {status.kind === "success" && (
        <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Contatos salvos. As páginas públicas já exibem os novos canais.
        </p>
      )}

      <section>
        <p className="label-field">Link do WhatsApp</p>
        <p className="mb-1 text-xs text-navy-400">
          Use o formato de link com o número internacional, ex. https://wa.me/5511999999999
        </p>
        <input
          name="whatsapp"
          defaultValue={initial.whatsapp}
          required
          placeholder="https://wa.me/…"
          className="input-field"
        />
      </section>

      <section>
        <p className="label-field">E-mail de contato</p>
        <input
          name="contact_email"
          type="email"
          defaultValue={initial.email}
          required
          placeholder="contato@biancamartins.com.br"
          className="input-field"
        />
      </section>

      <section>
        <p className="label-field">Perfil do Instagram</p>
        <input
          name="instagram"
          defaultValue={initial.instagram}
          required
          placeholder="https://instagram.com/…"
          className="input-field"
        />
      </section>

      <section>
        <p className="label-field">Perfil do LinkedIn</p>
        <input
          name="linkedin"
          defaultValue={initial.linkedin}
          required
          placeholder="https://www.linkedin.com/…"
          className="input-field"
        />
      </section>

      <section>
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-600">
          <MapPin className="h-3.5 w-3.5 text-gold-600" /> Endereço / área de atendimento
        </p>
        <p className="mb-1 text-xs text-navy-400">
          Exibido na página “Contato” e no rodapé. Ex.: Londrina — PR & atendimento remoto para todo o país.
        </p>
        <input
          name="contact_address"
          defaultValue={initial.address}
          required
          placeholder="Londrina — PR & atendimento remoto para todo o país"
          className="input-field"
        />
      </section>

      <section>
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-600">
          <Clock className="h-3.5 w-3.5 text-gold-600" /> Horário de atendimento
        </p>
        <p className="mb-1 text-xs text-navy-400">
          Exibido na página “Contato” e no rodapé. Ex.: Segunda a sexta, das 9h às 18h.
        </p>
        <input
          name="contact_hours"
          defaultValue={initial.hours}
          required
          placeholder="Segunda a sexta, das 9h às 18h"
          className="input-field"
        />
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" disabled={status.kind === "saving"} className="btn-primary">
          <Save className="h-4 w-4" />
          {status.kind === "saving" ? "Salvando…" : "Salvar contatos"}
        </button>
        <a href="/contato" target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <MessagesSquare className="h-4 w-4" /> Ver página de contato
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-800">
          <ExternalLink className="h-4 w-4" /> Ver o site
        </a>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Save, Settings2 } from "lucide-react";

import { saveNotifyRecipientAction } from "@/server/email-notify";

/**
 * Configura o e-mail de DESTINO que recebe as mensagens do formulário público.
 * Persiste na coluna contact_recipient_email (site_settings, id=1).
 */
export default function EmailNotificationsForm({
  initial = ""
}: {
  initial?: string;
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
    const result = await saveNotifyRecipientAction(fd);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({ kind: "success" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status.kind === "error" && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </p>
      )}
      {status.kind === "success" && (
        <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Endereço de notificação atualizado.
        </p>
      )}

      <div>
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-600">
          <Inbox className="h-3.5 w-3.5 text-gold-600" /> E-mail que recebe as mensagens do site
        </p>
        <p className="mb-1 text-xs text-navy-400">
          Para onde serão disparados os e-mails com os contatos recebidos. Vazio =
          usa o “E-mail de contato” acima.
        </p>
        <input
          name="recipient_email"
          type="email"
          defaultValue={initial || ""}
          placeholder="bianca@biancamartins.com.br"
          className="input-field"
        />
      </div>

      <div className="rounded-sm border border-navy-800/10 bg-ivory-50 px-4 py-3 text-xs leading-relaxed text-navy-500">
        <p className="inline-flex items-start gap-2">
          <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          <span>
            O envio usa o SMTP configurado no <code className="font-mono">.env.local</code>{" "}
            do servidor (<code className="font-mono">SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS</code>).
            Se ainda não configurado, as mensagens ficam salvas apenas na caixa “Mensagens”.
          </span>
        </p>
      </div>

      <button type="submit" disabled={status.kind === "saving"} className="btn-primary">
        <Save className="h-4 w-4" />
        {status.kind === "saving" ? "Salvando…" : "Salvar destino de notificação"}
      </button>
    </form>
  );
}

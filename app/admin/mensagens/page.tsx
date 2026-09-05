import type { Metadata } from "next";

import { listAdminMessages } from "@/server/admin-data";
import MailManager from "@/components/admin/MailManager";

export const metadata: Metadata = { title: "Mensagens", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminMensagensPage() {
  const messages = await listAdminMessages().catch(() => []);

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Mensagens de contato</h1>
        <p className="mt-1 text-sm text-navy-500">
          {messages.length} mensagem(ns) recebida(s)
          {unread > 0 && <span className="ml-1 inline-flex items-center rounded-full bg-gold-500/20 px-2.5 py-0.5 text-xs font-bold text-gold-700">
            {unread} não lida{unread > 1 ? "s" : ""}
          </span>}
        </p>
      </div>

      <MailManager messages={messages} />

      <p className="text-xs text-navy-400">
        As mensagens entram nesta lista a partir do formulário da página /contato.
      </p>
    </div>
  );
}

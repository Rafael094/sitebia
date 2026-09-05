"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Mail, MailOpen, Trash2, ExternalLink, Phone, Tag } from "lucide-react";

import { deleteMessage, setMessageRead } from "@/server/messages";
import { cn, formatDate } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";

/** Grade interativa de mensagens recebidas. */
export default function MailManager({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const sorted = [...messages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const unread = sorted.filter((m) => !m.is_read).length;
  const allRead = unread === 0;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function markOne(id: string, read: boolean) {
    await setMessageRead(id, read);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta mensagem?")) return;
    await deleteMessage(id);
    if (expandedId === id) setExpandedId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <div className="card p-12 text-center text-sm text-navy-500">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-navy-200" />
          Nenhuma mensagem de contato recebida ainda.
        </div>
      ) : (
        sorted.map((m) => {
          const expanded = expandedId === m.id;
          return (
            <article key={m.id} className={cn("card overflow-hidden transition-colors", !m.is_read && "border-gold-500/60")}>
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : m.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    m.is_read ? "bg-navy-800/5 text-navy-400" : "bg-gold-500/20 text-gold-700"
                  )}
                >
                  {m.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    {!m.is_read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" aria-label="Não lida" />
                    )}
                    <span className={cn("truncate font-semibold", m.is_read ? "text-navy-600" : "text-navy-900")}>
                      {m.name}
                    </span>
                  </span>
                  <span className="block truncate text-sm text-navy-400">
                    {m.subject || "Sem assunto"} · {m.email}
                  </span>
                </span>
                <span className="whitespace-nowrap text-xs text-navy-400">{formatDate(m.created_at, false)}</span>
              </button>

              {expanded && (
                <div className="space-y-4 border-t border-navy-800/10 p-5">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">{m.message}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-navy-600">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2 hover:text-navy-900">
                      <ExternalLink className="h-3.5 w-3.5" /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {m.phone}
                      </a>
                    )}
                    {m.subject && (
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> {m.subject}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => markOne(m.id, !m.is_read)}
                      className="btn-ghost !px-4 !py-2 text-xs"
                    >
                      {m.is_read ? "Marcar como não lida" : "Marcar como lida"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                    <span className="ml-auto text-xs text-navy-400">{formatDate(m.created_at)}</span>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}

      {!allRead && sorted.length > 0 && (
        <button
          type="button"
          onClick={() => {
            sorted.filter((x) => !x.is_read).forEach((x) => markOne(x.id, true));
            router.refresh();
          }}
          className="text-sm font-semibold text-navy-700 hover:text-navy-900"
        >
          Marcar todas como lidas
        </button>
      )}
    </div>
  );
}

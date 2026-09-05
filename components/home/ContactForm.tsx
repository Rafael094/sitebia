"use client";

"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { submitContactMessage } from "@/server/contact";

/** Formulário público de contato (grava em contact_messages pelo side do servidor). */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const result = await submitContactMessage(fd);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSent(true);
        (e.currentTarget as HTMLFormElement).reset();
      }
    } catch {
      setError("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold-500" />
        <h3 className="mt-4 font-display text-xl font-semibold text-navy-900">Mensagem enviada!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-navy-600">
          Agradecemos o contato. Sua mensagem ficou registrada e retornaremos o mais breve possível.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6">
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      {error && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label-field">Nome *</label>
          <input id="name" name="name" required minLength={2} className="input-field"
            placeholder="Seu nome" />
        </div>
        <div>
          <label htmlFor="email" className="label-field">E-mail *</label>
          <input id="email" name="email" type="email" required className="input-field"
            placeholder="voce@empresa.com" />
        </div>
        <div>
          <label htmlFor="phone" className="label-field">Telefone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" className="input-field"
            placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label htmlFor="subject" className="label-field">Assunto</label>
          <input id="subject" name="subject" className="input-field"
            placeholder="Ex.: Parceria de P&D" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label-field">Mensagem *</label>
        <textarea id="message" name="message" required minLength={10} rows={6} className="input-field"
          placeholder="Conte-nos sobre sua ideia, projeto ou necessidade…" />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Enviar mensagem
          </>
        )}
      </button>

      <p className="text-xs text-navy-400">
        Ao enviar você concorda em ser contactado(a) em retorno a esta solicitação.
        Seus dados ficam armazenados com segurança.
      </p>
    </form>
  );
}

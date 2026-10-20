"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, PlugZap, Send } from "lucide-react";

interface SmtpStatusResponse {
  ok: boolean;
  configured: boolean;
  missing: string[];
  host: string | null;
  port: number | null;
  secure: boolean;
  from: string | null;
  recipient: string | null;
  verified?: boolean;
  delivered?: boolean;
  message?: string;
  error?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "busy"; action: "verify" | "send" }
  | { kind: "result"; data: SmtpStatusResponse };

/**
 * Diagnóstico do SMTP configurado na Vercel (Environment Variables) ou no
 * .env.local. Chama /api/admin/smtp-test (protegida por sessão de admin) para:
 *   1) conferir quais variáveis chegaram no runtime;
 *   2) autenticar no servidor SMTP;
 *   3) enviar um e-mail de teste para o destino das notificações.
 */
export default function SmtpTestPanel() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function run(action: "verify" | "send") {
    setState({ kind: "busy", action });
    try {
      const res = await fetch("/api/admin/smtp-test", {
        method: action === "send" ? "POST" : "GET",
        headers: action === "send" ? { "Content-Type": "application/json" } : undefined,
        body: action === "send" ? JSON.stringify({}) : undefined
      });
      const data = (await res.json()) as SmtpStatusResponse;
      setState({ kind: "result", data });
    } catch {
      setState({
        kind: "result",
        data: {
          ok: false,
          configured: false,
          missing: [],
          host: null,
          port: null,
          secure: false,
          from: null,
          recipient: null,
          error: "Não foi possível contatar a rota de teste."
        }
      });
    }
  }

  const busy = state.kind === "busy" ? state.action : null;
  const data = state.kind === "result" ? state.data : null;
  const success = Boolean(data && (data.delivered || data.verified));

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run("verify")}
          disabled={busy !== null}
          className="btn-ghost !px-4 !py-2 text-sm"
        >
          {busy === "verify" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlugZap className="h-4 w-4" />
          )}
          {busy === "verify" ? "Verificando…" : "Verificar SMTP"}
        </button>
        <button
          type="button"
          onClick={() => run("send")}
          disabled={busy !== null}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          {busy === "send" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {busy === "send" ? "Enviando…" : "Enviar e-mail de teste"}
        </button>
      </div>

      {data && (
        <div
          role="status"
          className={`space-y-2 rounded-sm border px-4 py-3 text-xs leading-relaxed ${
            success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="inline-flex items-start gap-2 font-semibold">
            {success ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{data.message ?? data.error ?? "Resultado indisponível."}</span>
          </p>

          {data.missing.length > 0 && (
            <p>
              Faltando:{" "}
              {data.missing.map((v) => (
                <code key={v} className="mr-1 font-mono">
                  {v}
                </code>
              ))}
            </p>
          )}

          <p className="font-mono">
            host: {data.host ?? "—"} · porta: {data.port ?? "—"} · tls:{" "}
            {data.secure ? "sim" : "não"} · de: {data.from ?? "—"} · para:{" "}
            {data.recipient ?? "—"}
          </p>
        </div>
      )}
    </div>
  );
}

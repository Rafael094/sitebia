import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Campos preenchidos no formulário público de contato. */
export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface MailResult {
  /** true quando houve tentativa de envio (SMTP configurado no ambiente). */
  attempted: boolean;
  /** true quando o envio ocorreu com sucesso. */
  delivered: boolean;
  /** Mensagem amigável quando o envio falhou (a mensagem ainda foi registrada). */
  error?: string;
}

/**
 * Nomes das variáveis SMTP que o envio exige.
 * Usado pela tela /admin/configuracoes para dizer exatamente o que falta
 * (apenas os NOMES — nenhum valor secreto é exposto).
 */
export const SMTP_REQUIRED_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS"
] as const;

/** Lê do ambiente sem deixar espaços acidentais (comum ao colar na Vercel). */
function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** Variáveis SMTP obrigatórias que ainda estão vazias. */
export function missingSmtpVars(): string[] {
  return SMTP_REQUIRED_VARS.filter((name) => !env(name));
}

/** SMTP minimamente configurado (.env.local em dev / Environment Variables na Vercel)? */
export function isSmtpConfigured(): boolean {
  return missingSmtpVars().length === 0;
}

/**
 * Porta configurada (padrão 587). Valores inválidos caem no padrão para não
 * quebrar o envio com `NaN`.
 */
function smtpPort(): number {
  const parsed = Number(env("SMTP_PORT"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 587;
}

/**
 * O modo seguro (TLS na conexão) é ligado na 465 e em qualquer porta exceto a
 * 587. `SMTP_SECURE` (true/false) permite forçar o comportamento quando o
 * provedor usa uma porta não padrão.
 */
function smtpSecure(): boolean {
  const override = env("SMTP_SECURE").toLowerCase();
  if (override === "true" || override === "1" || override === "yes") return true;
  if (override === "false" || override === "0" || override === "no") return false;
  return smtpPort() !== 587;
}

/**
 * Cria o transporte SMTP a partir das variáveis de ambiente.
 *
 * Brevo (recomendado): host `smtp-relay.brevo.com`, porta `587` e STARTTLS.
 * `requireTLS` garante que a conexão seja criptografada antes do AUTH; os
 * timeouts evitam que um formulário fique pendurado se o provedor não responder.
 */
function createTransport(): Transporter {
  const secure = smtpSecure();
  return nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port: smtpPort(),
    secure,
    requireTLS: !secure,
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS")
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    tls: {
      minVersion: "TLSv1.2"
    }
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const GW = 'style="background:#c5a059;color:#fff;display:inline-block;padding:2px 8px;border-radius:3px;font-family:Arial;letter-spacing:.02em"';
const KV = (k: string, v: string) =>
  `<tr><td style="color:#8a7350;font-family:Arial;font-size:12px;padding:12px 0 2px;text-transform:uppercase;letter-spacing:.05em">${k}</td></tr>
   <tr><td style="color:#1c2b3a;font-family:Arial;font-size:16px;padding:0 0 8px">${v}</td></tr>`;

/** Corpo HTML do e-mail de notificação (informações legíveis e escapadas). */
export function buildContactHtmlHTML(p: ContactPayload): string {
  const comuns = (k: string, v: string) => KV(k, escapeHtml(v || "—"));
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#ede7db;font-family:Georgia,serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede7db;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;max-width:100%">
    <tr><td style="background:#0d1b2a;padding:22px 26px">
      <div ${GW} style="margin-bottom:8px">Novo contato recebido</div>
      <h1 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:.02em">Site — Formulário de Contato</h1>
    </td></tr>
    <tr><td style="padding:22px 26px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${comuns("Nome", p.name)}
        ${comuns("E-mail", p.email)}
        ${comuns("Telefone / WhatsApp", p.phone)}
        ${comuns("Assunto", p.subject)}
        ${KV("Mensagem", `<div style="white-space:pre-wrap">${escapeHtml(p.message)}</div>`)}
      </table>
      <p style="color:#8a7350;font-size:13px;font-family:Arial;border-top:1px solid #efe6d6;padding-top:14px;margin:6px 0 0">
        Responda para <a href="mailto:${escapeHtml(p.email)}" style="color:#b3892e;font-weight:bold">${escapeHtml(p.email)}</a>.
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

/**
 * Extrai apenas o endereço do remetente. Aceita tanto `email@dominio` quanto
 * `Nome <email@dominio>` (formato usado no `.env.example`).
 */
function fromAddress(): string {
  const raw =
    env("SMTP_FROM") || env("SMTP_USER") || "no-reply@biancamartins.com.br";
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] ?? raw).trim();
}

/** Cabeçalho “De:” válido, com nome de exibição, sem duplicar `<...>`. */
function fromHeader(): string {
  const raw = env("SMTP_FROM").trim();
  if (!raw) return `"Site Bianca Martins" <${fromAddress()}>`;
  return raw.includes("<") ? raw : `"Site Bianca Martins" <${raw}>`;
}

/**
 * Aviso (apenas log) quando não há `SMTP_FROM`: provedores como o Brevo recusam
 * remetentes não verificados, e o fallback para `SMTP_USER` costuma ser um
 * login interno (`xxxx@smtp-brevo.com`), que não serve como remetente.
 */
function warnIfSenderLooksInternal(): void {
  if (env("SMTP_FROM")) return;
  const sender = fromAddress();
  if (sender.endsWith("@smtp-brevo.com")) {
    console.warn(
      "SMTP_FROM não definido e SMTP_USER é um login interno do Brevo. Defina SMTP_FROM com um remetente verificado (Senders & Domains)."
    );
  }
}

type SettingsRow = { contact_recipient_email?: string | null; contact_email?: string | null };

/**
 * Extrai um endereço de e-mail válido de um valor como `Nome <email@dominio>`.
 * Ignora o login interno do Brevo (`xxxx@smtp-brevo.com`), que não é uma
 * caixa real e não deve receber notificações.
 */
function usableEmail(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  const match = raw.match(/<([^>]+)>/);
  const address = (match?.[1] ?? raw).trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) return null;
  if (address.toLowerCase().endsWith("@smtp-brevo.com")) return null;
  return address;
}

/** E-mail de destino configurado no painel (site_settings), com fallback. */
export async function getRecipientEmail(): Promise<string | null> {
  let row: SettingsRow | null = null;
  try {
    const admin = getAdminSupabaseClient();
    const { data } = await admin
      .from("site_settings")
      .select("contact_recipient_email, contact_email")
      .eq("id", 1)
      .maybeSingle();
    row = (data ?? {}) as SettingsRow;
  } catch {
    row = null;
  }
  // 1) Destino específico salvo no painel.
  const custom = row?.contact_recipient_email?.trim();
  if (custom) return custom;

  // 2) Override explícito do ambiente (CONTACT_RECIPIENT_EMAIL).
  const envRecipient = usableEmail(process.env.CONTACT_RECIPIENT_EMAIL ?? "");
  if (envRecipient) return envRecipient;

  // 3) E-mail público de contato do site e fallbacks SMTP.
  const fallback = row?.contact_email?.trim();
  if (fallback) return fallback;
  return (
    usableEmail(env("SMTP_FROM")) ||
    usableEmail(env("SMTP_USER")) ||
    null
  );
}

export interface SmtpStatus {
  /** true quando as 4 variáveis SMTP estão preenchidas no ambiente. */
  configured: boolean;
  /** Nomes das variáveis ainda vazias (nunca expõe valores). */
  missing: string[];
  /** Host/porta configurados (sem usuário/senha). */
  host: string | null;
  port: number | null;
  secure: boolean;
  /** Remetente que aparece no "De:" do e-mail. */
  from: string | null;
  /** Destino atual das notificações. */
  recipient: string | null;
}

/**
 * Diagnóstico (somente leitura) do que está configurado no ambiente atual —
 * útil para conferir se as variáveis da Vercel chegaram no runtime.
 * Nenhum segredo é retornado.
 */
export async function getSmtpStatus(): Promise<SmtpStatus> {
  const missing = missingSmtpVars();
  return {
    configured: missing.length === 0,
    missing,
    host: env("SMTP_HOST") || null,
    port: env("SMTP_HOST") ? smtpPort() : null,
    secure: smtpSecure(),
    from: env("SMTP_FROM") || env("SMTP_USER") || null,
    recipient: await getRecipientEmail().catch(() => null)
  };
}

export interface SmtpCheckResult extends SmtpStatus {
  /** Conexão/autenticação aceita pelo servidor SMTP. */
  verified: boolean;
  /** Mensagem amigável para o painel. */
  message: string;
}

/**
 * Testa as credenciais SMTP da Vercel/.env.local sem enviar e-mail:
 * abre a conexão e executa o AUTH do provedor.
 */
export async function verifySmtpConnection(): Promise<SmtpCheckResult> {
  const status = await getSmtpStatus();
  if (!status.configured) {
    return {
      ...status,
      verified: false,
      message: `Faltam variáveis na Vercel: ${status.missing.join(", ")}. Adicione em Settings → Environment Variables e faça Redeploy.`
    };
  }

  const transport = createTransport();
  try {
    await transport.verify();
    return {
      ...status,
      verified: true,
      message: status.from?.endsWith("@smtp-brevo.com")
        ? "Conexão e autenticação SMTP OK. Atenção: defina SMTP_FROM com um remetente verificado no Brevo (Senders & Domains) — o login interno @smtp-brevo.com não é aceito como remetente."
        : "Conexão e autenticação SMTP OK."
    };
  } catch (err) {
    console.error("Falha ao verificar o SMTP:", err);
    const reason = err instanceof Error ? err.message : String(err);
    return {
      ...status,
      verified: false,
      message: `Não foi possível autenticar no SMTP: ${reason}`
    };
  } finally {
    transport.close();
  }
}

/**
 * Envia um e-mail de teste para o destino das notificações (ou para `to`).
 */
export async function sendTestEmail(
  to?: string
): Promise<SmtpCheckResult & { delivered: boolean; recipient: string | null }> {
  const status = await getSmtpStatus();
  const recipient = to?.trim() || status.recipient;

  if (!status.configured) {
    return {
      ...status,
      recipient,
      verified: false,
      delivered: false,
      message: `Faltam variáveis na Vercel: ${status.missing.join(", ")}. Adicione em Settings → Environment Variables e faça Redeploy.`
    };
  }

  if (!recipient) {
    return {
      ...status,
      verified: false,
      delivered: false,
      message:
        "Nenhum e-mail de destino configurado. Informe um endereço em /admin/configuracoes."
    };
  }

  const transport = createTransport();
  try {
    await transport.verify();
    warnIfSenderLooksInternal();
    await transport.sendMail({
      from: fromHeader(),
      to: recipient,
      subject: "Teste de envio — Site Bianca Martins",
      text: [
        "Este é um e-mail de teste enviado pelo painel do site.",
        `Se você recebeu esta mensagem, o SMTP está configurado corretamente.`,
        "",
        `Servidor: ${env("SMTP_HOST")}:${smtpPort()}`
      ].join("\n"),
      html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#ede7db;font-family:Arial">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden">
    <tr><td style="background:#0d1b2a;padding:20px 24px">
      <span style="background:#c5a059;color:#fff;display:inline-block;padding:2px 8px;border-radius:3px;font-size:12px">SMTP OK</span>
      <h1 style="margin:8px 0 0;color:#fff;font-size:18px">E-mail de teste</h1>
    </td></tr>
    <tr><td style="padding:22px 24px;color:#1c2b3a;font-size:15px;line-height:1.6">
      <p style="margin:0 0 10px">Se você recebeu esta mensagem, o envio de e-mails do site está funcionando.</p>
      <p style="margin:0;color:#8a7350;font-size:13px">Servidor: <code>${escapeHtml(`${env("SMTP_HOST")}:${smtpPort()}`)}</code></p>
    </td></tr>
  </table>
</td></tr></table></body></html>`
    });

    return {
      ...status,
      recipient,
      verified: true,
      delivered: true,
      message: `E-mail de teste enviado com sucesso para ${recipient}.`
    };
  } catch (err) {
    console.error("Falha no envio do e-mail de teste:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ...status,
      recipient,
      verified: false,
      delivered: false,
      message: `Falha ao enviar o teste: ${detail}`
    };
  } finally {
    transport.close();
  }
}

export async function sendContactNotification(
  payload: ContactPayload
): Promise<MailResult> {
  // 1) Grava sempre na caixa de entrada do painel (independente do SMTP).
  try {
    const supabase = await createSupabaseServerClient();
    await supabase
      .from("contact_messages")
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        subject: payload.subject,
        message: payload.message
      } as never);
  } catch (err) {
    console.error("Falha ao registrar mensagem de contato:", err);
  }

  if (!isSmtpConfigured()) {
    return { attempted: false, delivered: false };
  }

  const recipient = await getRecipientEmail();
  if (!recipient) {
    return { attempted: false, delivered: false };
  }

  const transport = createTransport();
  try {
    await transport.verify();
    warnIfSenderLooksInternal();
    await transport.sendMail({
      from: fromHeader(),
      to: recipient,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: `Novo contato — ${payload.subject || payload.name}`,
      text: [
        `Nome: ${payload.name}`,
        `E-mail: ${payload.email}`,
        `Telefone/WhatsApp: ${payload.phone || "—"}`,
        `Assunto: ${payload.subject || "—"}`,
        "",
        "Mensagem:",
        payload.message
      ].join("\n"),
      html: buildContactHtmlHTML(payload)
    });

    return { attempted: true, delivered: true };
  } catch (err) {
    console.error("Falha no envio do e-mail via SMTP:", err);
    return {
      attempted: true,
      delivered: false,
      error: "A mensagem foi registrada, mas o envio do e-mail falhou."
    };
  } finally {
    transport.close();
  }
}

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

/** SMTP minimamente configurado no .env.local? */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
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

function fromAddress(): string {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "no-reply@biancamartins.com.br";
}

type SettingsRow = { contact_recipient_email?: string | null; contact_email?: string | null };

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
  const custom = row?.contact_recipient_email?.trim();
  if (custom) return custom;
  const fallback = row?.contact_email?.trim();
  if (fallback) return fallback;
  return (
    process.env.CONTACT_RECIPIENT_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    null
  );
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

  try {
    const isSecure = Number(process.env.SMTP_PORT) === 465;
    const transport: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transport.sendMail({
      from: `"Site Bianca Martins" <${fromAddress()}>`,
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
  }
}

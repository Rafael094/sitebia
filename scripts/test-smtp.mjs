#!/usr/bin/env node
/**
 * Valida a configuração SMTP do Brevo (ou outro provedor) sem abrir o site.
 *
 * Uso:
 *   npm run smtp:test
 *   npm run smtp:test -- --send
 *   npm run smtp:test -- --send --to=seu@email.com
 *
 * O script lê `.env.local` / `.env`, confere as variáveis obrigatórias,
 * autentica no servidor SMTP e (com --send) envia um e-mail de teste.
 * A senha/chave NUNCA é impressa.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import nodemailer from "nodemailer";

const ROOT = process.cwd();

function loadEnvFile(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;

  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(full);
      return;
    } catch {
      // Cai no parser manual abaixo.
    }
  }

  const content = fs.readFileSync(full, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const withoutExport = trimmed.startsWith("export ")
      ? trimmed.slice(7).trim()
      : trimmed;
    const eq = withoutExport.indexOf("=");
    if (eq < 0) continue;

    const key = withoutExport.slice(0, eq).trim();
    if (!key || key in process.env) continue;

    let value = withoutExport.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const env = (name) => (process.env[name] ?? "").trim();

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const missing = required.filter((name) => !env(name));

const port = Number(env("SMTP_PORT") || 587);
const secureOverride = env("SMTP_SECURE").toLowerCase();
const secure =
  secureOverride === "true" || secureOverride === "1" || secureOverride === "yes"
    ? true
    : secureOverride === "false" ||
        secureOverride === "0" ||
        secureOverride === "no"
      ? false
      : port !== 587;

function fromAddress() {
  return env("SMTP_FROM") || env("SMTP_USER");
}

function emailOnly(value) {
  const match = value.match(/<([^>]+)>/);
  const address = (match?.[1] ?? value).trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address) ? address : null;
}

const args = process.argv.slice(2);
const shouldSend = args.includes("--send") || args.includes("--email");
const toArg = args
  .find((arg) => arg.startsWith("--to="))
  ?.slice("--to=".length)
  .trim();
const recipient =
  toArg ||
  emailOnly(env("CONTACT_RECIPIENT_EMAIL")) ||
  emailOnly(env("SMTP_FROM")) ||
  emailOnly(env("SMTP_USER"));

console.log("== Diagnóstico SMTP ==");
console.log(`host......: ${env("SMTP_HOST") || "(vazio)"}`);
console.log(`porta.....: ${env("SMTP_PORT") || "(vazia)"}`);
console.log(`TLS.......: ${secure ? "direto (465)" : "STARTTLS (587)"}`);
console.log(`usuário...: ${env("SMTP_USER") || "(vazio)"}`);
console.log(`remetente.: ${fromAddress() || "(vazio)"}`);
console.log(`destino...: ${recipient || "(não definido)"}`);
console.log(`senha.....: ${env("SMTP_PASS") ? "definida (não exibida)" : "VAZIA"}`);

if (missing.length > 0) {
  console.error("\n[ERRO] Faltam variáveis: " + missing.join(", "));
  console.error(
    "Preencha no .env.local (ou na Vercel) e rode novamente. No Brevo, use a SMTP key, não a senha da conta."
  );
  process.exit(1);
}

if (!Number.isFinite(port) || port <= 0) {
  console.error("\n[ERRO] SMTP_PORT inválida.");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: env("SMTP_HOST"),
  port,
  secure,
  requireTLS: !secure,
  auth: {
    user: env("SMTP_USER"),
    pass: env("SMTP_PASS")
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  tls: { minVersion: "TLSv1.2" }
});

try {
  console.log("\nAutenticando no servidor SMTP…");
  await transport.verify();
  console.log("[OK] Conexão e autenticação aceitas pelo provedor.");

  if (shouldSend) {
    if (!recipient) {
      console.error(
        "\n[ERRO] Nenhum destinatário. Use --to=email@dominio.com ou defina CONTACT_RECIPIENT_EMAIL."
      );
      process.exitCode = 1;
    } else {
      console.log(`\nEnviando e-mail de teste para ${recipient}…`);
      const info = await transport.sendMail({
        from: `"Site Bianca Martins" <${fromAddress()}>`,
        to: recipient,
        subject: "Teste SMTP — Site Bianca Martins",
        text: [
          "Este é um e-mail de teste do formulário de contato.",
          "Se você recebeu esta mensagem, o SMTP está configurado corretamente.",
          "",
          `Servidor: ${env("SMTP_HOST")}:${port}`
        ].join("\n")
      });
      console.log(`[OK] E-mail enviado. ID: ${info.messageId}`);
    }
  } else {
    console.log(
      "\nDica: rode `npm run smtp:test -- --send` para enviar um e-mail de teste."
    );
  }
} catch (err) {
  console.error("\n[ERRO] Falha no SMTP:");
  console.error(err instanceof Error ? err.message : String(err));
  console.error(
    "\nChecklist Brevo: SMTP key correta, remetente verificado em Senders & Domains e porta 587/STARTTLS."
  );
  process.exitCode = 1;
} finally {
  transport.close();
}

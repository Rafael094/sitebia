// update-hero-image.mjs
//
// Atualiza o `image_url` da seção home_hero em page_contents para a nova foto.
// O banco tem prioridade sobre o fallback em lib/page-content.ts, então sem
// este ajuste o Hero continua exibindo a imagem antiga.
//
// Uso:
//   node scripts/update-hero-image.mjs            (aplica)
//   node scripts/update-hero-image.mjs --dry-run  (só mostra o que faria)

import fs from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const NOVO = "/images/bianca-martins.jpg";
const ANTIGO = "/images/1702302801691.jpg";

function loadEnv(path = ".env.local") {
  if (!fs.existsSync(path)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const env = { ...loadEnv(), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltando NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  console.error("(a service role key é necessária para escrever em page_contents)");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json"
};

// 1) Estado atual
const resAtual = await fetch(
  `${url}/rest/v1/page_contents?select=section_key,image_url&section_key=eq.home_hero`,
  { headers }
);
const linhas = await resAtual.json();

if (!linhas.length) {
  console.log("Nenhuma linha home_hero no banco — o site já usa o fallback do código. Nada a fazer.");
  process.exit(0);
}

console.log(`Antes:  ${linhas[0].image_url ?? "(vazio)"}`);

if (linhas[0].image_url === NOVO) {
  console.log("Já está atualizado. Nada a fazer.");
  process.exit(0);
}

if (DRY_RUN) {
  console.log(`Depois: ${NOVO}   [dry-run: nada foi gravado]`);
  process.exit(0);
}

// 2) Atualiza
const resUpd = await fetch(`${url}/rest/v1/page_contents?section_key=eq.home_hero`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({ image_url: NOVO })
});

if (!resUpd.ok) {
  console.error(`Falha ao atualizar: HTTP ${resUpd.status} ${await resUpd.text()}`);
  process.exit(1);
}

const atualizadas = await resUpd.json();
console.log(`Depois: ${atualizadas[0]?.image_url ?? "(sem retorno)"}`);
console.log(`\nOK — ${atualizadas.length} linha(s) atualizada(s). (antigo: ${ANTIGO})`);

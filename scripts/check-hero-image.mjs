// check-hero-image.mjs
//
// Diagnóstico: mostra o `image_url` gravado no banco para a seção home_hero.
// Serve para explicar por que o site pode continuar exibindo a foto antiga
// mesmo depois de o fallback em lib/page-content.ts ser atualizado.
//
// Uso:  node scripts/check-hero-image.mjs

import fs from "node:fs";

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
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltando NEXT_PUBLIC_SUPABASE_URL e/ou chave do Supabase no .env.local");
  process.exit(1);
}

const res = await fetch(
  `${url}/rest/v1/page_contents?select=section_key,image_url&section_key=eq.home_hero`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);

if (!res.ok) {
  console.error(`Falha na consulta: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}

const rows = await res.json();

if (!rows.length) {
  console.log("Nenhuma linha em page_contents para 'home_hero'.");
  console.log("=> O site usa o fallback de lib/page-content.ts (/images/bianca-martins.jpg).");
  process.exit(0);
}

const atual = rows[0].image_url ?? "(vazio)";
const esperado = "/images/bianca-martins.jpg";

console.log(`Banco (page_contents.home_hero.image_url): ${atual}`);
console.log(`Esperado pelo código:                     ${esperado}`);
console.log(atual === esperado ? "\n=> OK: já está atualizado." : "\n=> DIVERGENTE: o banco sobrescreve o código. Atualize em /admin/secoes/home_hero");

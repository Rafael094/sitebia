// ensure-uploads-bucket.mjs
//
// Garante que o bucket público "uploads" (usado pelo envio da imagem do Hero
// via input IMAGE_FILE no painel /admin/secoes/home_hero) exista no Storage.
// Idempotente: se o bucket já existir, nada é alterado.
//
// Uso:  node scripts/ensure-uploads-bucket.mjs
//
// Requer SUPABASE_SERVICE_ROLE_KEY no .env.local (a criação de buckets exige
// a service role — a chave anon não tem permissão).

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
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = "uploads";

if (!url || !key) {
  console.error(
    "Faltando NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local"
  );
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

// 1) Verifica se o bucket já existe.
const listRes = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, { headers });
if (listRes.ok) {
  console.log(`=> Bucket "${BUCKET}" já existe. Nada a fazer.`);
  process.exit(0);
}

// 2) Cria o bucket público.
const createRes = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true })
});

if (!createRes.ok) {
  const detail = await createRes.text();
  console.error(`Falha ao criar o bucket "${BUCKET}": ${createRes.status} ${detail}`);
  process.exit(1);
}

console.log(`=> Bucket "${BUCKET}" criado com sucesso (público).`);
console.log(
  "As políticas de storage são criadas pela migração supabase/migrations_v4_uploads_bucket.sql."
);

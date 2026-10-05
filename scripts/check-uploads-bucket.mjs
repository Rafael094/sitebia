// check-uploads-bucket.mjs
// Diagnóstico rápido: confirma se o bucket "uploads" existe no Storage.
// Uso: node scripts/check-uploads-bucket.mjs

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

if (!url || !key) {
  console.error("Faltando NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const res = await fetch(`${url}/storage/v1/bucket/uploads`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});

if (res.ok) {
  const data = await res.json();
  console.log("=> OK: bucket 'uploads' encontrado.");
  console.log(JSON.stringify(data, null, 2));
} else {
  console.error(`=> FALHA (${res.status}): ${await res.text()}`);
  process.exit(1);
}

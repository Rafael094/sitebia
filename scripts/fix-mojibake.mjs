// ============================================================================
// Corrige mojibake (UTF-8 lido como Latin-1) em arquivos de texto do projeto.
//
// Sintoma: "SeÃ§Ãµes", "TÃ­tulo", "Â·", "â€œ...â€", "DescriÃ§Ã£o".
// Causa: um byte UTF-8 (2 ou 3 bytes) virou N caracteres "Ã"/"Â"/"â€¦" no fonte.
//
// Uso:
//   node scripts/fix-mojibake.mjs            -> relatorio (nao grava nada)
//   node scripts/fix-mojibake.mjs --apply    -> aplica as correcoes
//
// Seguranca:
//  - So altera linhas que realmente contenham a assinatura de mojibake.
//  - Preserva BOM, quebras CRLF/LF e o restante do arquivo byte a byte.
//  - Idempotente: rodar de novo nao muda nada.
// ============================================================================

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");

/** Extensoes de texto que podem conter acentuacao PT-BR. */
const EXT = /\.(ts|tsx|js|mjs|cjs|css|json|sql|md|html|txt)$/;

/** Nao varrer o proprio script (contem os literais de deteccao). */
const SELF = path.resolve(process.argv[1] ? process.argv[1] : "");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", ".vercel", "dist", "build", "out"
]);

/** Assinaturas de mojibake: Latin-1 resultante de UTF-8 mal decodificado. */
const BAD =
  /[\u00C3][\u0080-\u00BF]|[\u00C2][\u00A0-\u00BF\u2013\u2014\u2018-\u201D\u2026\u00B7]|\u00E2[\u0080-\u00BF]{2}/;

function walk(dir, out = []) {
  for (const entry of readdirSafe(dir)) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (EXT.test(entry.name)) {
      if (path.resolve(full) === SELF) continue;
      out.push(full);
    }
  }
  return out;
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * Converte mojibake -> UTF-8 real.
 *
 * Cada trecho suspeito e reinterpretado como bytes Latin-1 e decodificado
 * como UTF-8. Como o dano pode ter se acumulado em mais de uma camada
 * ("Ã§Ã£" -> "çÃ£" -> "çã"), o processo se repete ate estabilizar.
 *
 * Se um passo produzir U+FFFD (decodificacao invalida), o resultado daquele
 * passo e descartado — assim textos legítimos que apenas contem "Ã" ou "Â"
 * nao sao corrompidos.
 */
function fixMojibake(text) {
  let current = text;
  for (let pass = 0; pass < 5; pass += 1) {
    if (!BAD.test(current)) break;
    const next = current.replace(new RegExp(BAD.source, "g"), (chunk) => {
      const decoded = Buffer.from(chunk, "latin1").toString("utf8");
      if (decoded.includes("\uFFFD")) return chunk;
      return decoded;
    });
    if (next === current) break;
    current = next;
  }
  return current;
}

const files = walk(".");
let changedFiles = 0;
let changedLines = 0;

for (const file of files) {
  const original = readFileSync(file); // Buffer: preserva BOM e bytes
  const hasBom =
    original[0] === 0xef && original[1] === 0xbb && original[2] === 0xbf;
  const body = original.toString("utf8");
  const text = hasBom ? body.slice(1) : body;

  if (!BAD.test(text)) continue;

  const lines = text.split(/\r?\n/);
  let localCount = 0;

  const fixedLines = lines.map((line) => {
    if (!BAD.test(line)) return line;
    const fixed = fixMojibake(line);
    if (fixed !== line) localCount += 1;
    return fixed;
  });

  if (localCount === 0) continue;

  changedFiles += 1;
  changedLines += localCount;

  console.log(
    `${APPLY ? "corrigindo" : "encontrado"} ${localCount} linha(s): ${file}`
  );

  if (APPLY) {
    const out = fixedLines.join(text.includes("\r\n") ? "\r\n" : "\n");
    writeFileSync(file, (hasBom ? "\uFEFF" : "") + out, "utf8");
  }
}

console.log(
  `\n${APPLY ? "Aplicado" : "Dry-run"}: ${changedLines} linha(s) em ${changedFiles} arquivo(s).`
);
if (!APPLY && changedLines > 0) {
  console.log("Rode com --apply para gravar as correcoes.");
}

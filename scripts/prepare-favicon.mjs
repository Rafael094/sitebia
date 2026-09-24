// prepare-favicon.mjs
//
// Gera os ícones do site (favicon) a partir do MESMO monograma usado na logo:
//   public/images/brand/logo-monograma-dark.png  →  monograma navy + dourado
//
// Por que usar a versão "dark":
//   O favicon fica em abas claras (fundo branco/cinza) na maioria dos navegadores,
//   então o monograma navy #0D1B2A tem o melhor contraste. A versão "light"
//   (traço branco) desapareceria nessas abas.
//
// Por que o favicon é quadrado, com margem e fundo:
//   - O monograma é estreito; a aba do navegador recorta em quadrado. Sem a
//     margem + fundo, o traço encostaria nas bordas e perderia legibilidade.
//   - O fundo navy arredondado garante leitura tanto em abas claras quanto em
//     abas escuras (o dourado contrasta com as duas), e vira um "app icon"
//     coeso no atalho de celular (apple-icon).
//
// Saídas (todas em public/):
//   favicon.ico    → 16/32/48px agregados no mesmo arquivo (convenção clássica,
//                    inclui o pedido automático de /favicon.ico pelos navegadores)
//   favicon-32.png → PNG quadrado (Android/Chrome, alguns leitores de feed)
//   icon-192.png   → Android/PWA
//   icon-512.png   → Android/PWA + maskable (Android mostra este em atalhos)
//   apple-icon.png → 180px, ícone "Adicionar à Tela de Início" do iOS
//
// Uso:
//   node scripts/prepare-favicon.mjs

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const brandDir = path.join(publicDir, "images", "brand");

const SRC = path.join(brandDir, "logo-monograma-dark.png");

// Paleta da marca (mesma do Logo.tsx / globals.css)
const NAVY = { r: 13, g: 27, b: 42 }; // #0D1B2A

// --- Geometria do ícone ------------------------------------------------------
// O monograma ocupa ~420x458 dentro do quadrado 512x512 (tinta em 46,28).
// IMAGE_FILL = quanto do lado final o monograma ocupa, deixando margem de respiro.
const IMAGE_FILL = 0.72;
// Raio do fundo arredondado, proporcional ao lado (cantos suaves tipo "app icon").
const CORNER_RATIO = 0.22;

/** Canto arredondado (mesma lógica do "squircle" dos ícones de app). */
function roundedRectMask(size, radius) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
       <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#ffffff"/>
     </svg>`
  );
}

/** Lê o bbox da tinta (alfa > 10) do PNG de origem. */
async function inkBox(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error(`Nenhum pixel de tinta encontrado em ${source}`);

  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Compõe o ícone em `size` px: fundo navy arredondado + monograma centralizado.
 *
 * Importante: recortamos a tinta (bbox) ANTES de redimensionar. Se
 * redimensionarmos o arquivo 512x512 inteiro com `fit: "contain"`, o monograma
 * (estreito) fica cercado por transparência e o composite seguinte achata a
 * imagem, lavando o dourado do traço (~12% -> ~1% de tinta dourada).
 *
 * @param {number} size
 * @returns {Promise<Buffer>} PNG
 */
async function buildIcon(size) {
  const radius = Math.round(size * CORNER_RATIO);

  // 1. Recorta exatamente a tinta do monograma.
  const box = await inkBox(SRC);
  const cropped = await sharp(SRC).extract(box).png().toBuffer();

  // 2. Redimensiona para ocupar IMAGE_FILL do lado final (mantém proporção).
  const logoSize = Math.round(size * IMAGE_FILL);
  const logo = await sharp(cropped)
    .resize(logoSize, logoSize, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  // 3. Fundo navy arredondado (a máscara svg vira o alfa do retângulo).
  const background = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...NAVY, alpha: 1 }
    }
  })
    .composite([{ input: roundedRectMask(size, radius), blend: "dest-in" }])
    .png()
    .toBuffer();

  // 4. Centraliza o monograma sobre o fundo.
  const top = Math.round((size - logoMeta.height) / 2);
  const left = Math.round((size - logoMeta.width) / 2);

  return sharp(background)
    .composite([{ input: logo, top, left }])
    .png()
    .toBuffer();
}

/**
 * Empacota vários PNGs em um .ico (formato PNG-in-ICO, aceito por todos os
 * navegadores atuais e pelo Windows).
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: 1 = ícone
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(16 * entries.length);
  let offset = header.length + directory.length;

  entries.forEach((entry, index) => {
    const base = index * 16;
    const side = entry.size >= 256 ? 0 : entry.size; // 256 é representado como 0
    directory.writeUInt8(side, base + 0); // largura
    directory.writeUInt8(side, base + 1); // altura
    directory.writeUInt8(0, base + 2); // cores da paleta (0 = truecolor)
    directory.writeUInt8(0, base + 3); // reservado
    directory.writeUInt16LE(1, base + 4); // planos de cor
    directory.writeUInt16LE(32, base + 6); // bits por pixel
    directory.writeUInt32LE(entry.buffer.length, base + 8); // tamanho dos dados
    directory.writeUInt32LE(offset, base + 12); // deslocamento dos dados
    offset += entry.buffer.length;
  });

  return Buffer.concat([header, directory, ...entries.map((e) => e.buffer)]);
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const meta = await sharp(SRC).metadata();
  console.log(`Origem: ${path.relative(root, SRC)} (${meta.width}x${meta.height})`);
  console.log("Paleta: navy #0D1B2A + dourado #C5A059 do monograma\n");

  // PNGs padrão (Android / PWA / atalhos).
  const pngs = [
    { size: 32, file: "favicon-32.png" },
    { size: 180, file: "apple-icon.png" },
    { size: 192, file: "icon-192.png" },
    { size: 512, file: "icon-512.png" }
  ];

  for (const { size, file } of pngs) {
    const buffer = await buildIcon(size);
    await sharp(buffer).toFile(path.join(publicDir, file));
    console.log(`  -> public/${file.padEnd(16)} ${size}x${size}`);
  }

  // favicon.ico com os três tamanhos clássicos no mesmo arquivo.
  const icoSizes = [16, 32, 48];
  const entries = [];
  for (const size of icoSizes) {
    entries.push({ size, buffer: await buildIcon(size) });
  }

  await writeFile(path.join(publicDir, "favicon.ico"), buildIco(entries));
  console.log(
    `  -> public/${"favicon.ico".padEnd(16)} ${icoSizes.join("/")}px (${entries.length} imagens)`
  );

  console.log("\nConcluído.");
}

main().catch((error) => {
  console.error("Falha ao gerar o favicon:", error);
  process.exit(1);
});

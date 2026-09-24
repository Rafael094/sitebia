// _diag2.mjs (temporário) — testa variantes de composicao
import sharp from "sharp";

const SRC = "public/images/brand/logo-monograma-dark.png";
const SIZE = 512;
const logoSize = Math.round(SIZE * 0.72);
const off = Math.round((SIZE - logoSize) / 2);

const bg = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: { r: 13, g: 27, b: 42, alpha: 1 } }
}).composite([{
  input: Buffer.from('<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="512" height="512" rx="113" ry="113" fill="#ffffff"/></svg>'),
  blend: "dest-in"
}]).png().toBuffer();

const logo = await sharp(SRC).resize(logoSize, logoSize, {
  fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }
}).png().toBuffer();

async function probe(name, pipeline) {
  const buf = await pipeline;
  const { data, info } = await sharp(buf).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  let navy = 0, gold = 0, other = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 10) continue;
    if (Math.abs(r - 13) < 22 && Math.abs(g - 27) < 22 && Math.abs(b - 42) < 22) navy++;
    else if (r > 140 && g < 235 && b < 140 && r > g && g > b) gold++;
    else other++;
  }
  console.log(name.padEnd(28), "navy=" + navy, "gold=" + gold, "other=" + other);
}

// A) composite padrao
await probe("A) composite padrao", sharp(bg)
  .composite([{ input: logo, top: off, left: off }]).png().toBuffer());

// B) blend over explicito
await probe("B) blend 'over'", sharp(bg)
  .composite([{ input: logo, top: off, left: off, blend: "over" }]).png().toBuffer());

// D) usar o logo original 512 (sem resize) com resize final
const logoFull = await sharp(SRC).ensureAlpha().png().toBuffer();
await probe("D) logo 512 + composite + resize", sharp(bg)
  .composite([{ input: logoFull, top: 0, left: 0 }]).resize(SIZE, SIZE).png().toBuffer());

// E) criar canvas do tamanho final e desenhar o logo redimensionado no lugar
const logoAtOffset = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
}).composite([{ input: logo, top: off, left: off }]).png().toBuffer();
await probe("E) canvas + logo, depois sobre fundo", sharp(bg)
  .composite([{ input: logoAtOffset, blend: "over" }]).png().toBuffer());

// _diag4.mjs (temporario) — extrai o bbox da TINTA e recorta antes de redimensionar
import sharp from "sharp";

const SRC = "public/images/brand/logo-monograma-dark.png";

// 1) Achar o bbox real da tinta (alfa > 10)
const { data, info } = await sharp(SRC).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const a = data[(y * info.width + x) * info.channels + 3];
    if (a > 10) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
const w = maxX - minX + 1, h = maxY - minY + 1;
console.log("bbox da tinta:", w + "x" + h, "em", minX + "," + minY);

async function stats(label, input) {
  const r = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let navy = 0, gold = 0, other = 0, transp = 0;
  for (let i = 0; i < r.data.length; i += r.info.channels) {
    const R = r.data[i], G = r.data[i + 1], B = r.data[i + 2], A = r.data[i + 3];
    if (A < 10) { transp++; continue; }
    if (Math.abs(R - 13) < 25 && Math.abs(G - 27) < 25 && Math.abs(B - 42) < 25) navy++;
    else if (R > 130 && B < 150 && R > G && G >= B) gold++;
    else other++;
  }
  const ink = r.info.width * r.info.height - transp;
  console.log(label.padEnd(26) + " gold=" + gold + " (" + ((100 * gold) / ink).toFixed(1) + "% da tinta)  navy=" + navy);
}

// 2) Estrategia: extrair bbox -> resize -> colocar no canvas quadrado por offset
const cropped = await sharp(SRC).extract({ left: minX, top: minY, width: w, height: h })
  .png().toBuffer();
await stats("bbox extraido", cropped);

const SIZE = 512;
const logoSize = Math.round(SIZE * 0.72);
const inner = await sharp(cropped).resize(logoSize, logoSize, {
  fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 }
}).png().toBuffer();
await stats("bbox -> inside " + logoSize, inner);
const m = await sharp(inner).metadata();
console.log("  dimensoes:", m.width + "x" + m.height);

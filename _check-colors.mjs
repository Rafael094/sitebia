// _check-colors.mjs (temporário) — confere se o dourado aparece no icone
import sharp from "sharp";

const { data, info } = await sharp("public/icon-512.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let navy = 0, gold = 0, transparent = 0, white = 0, other = 0;
for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
  if (a < 10) { transparent++; continue; }
  // navy #0D1B2A
  if (Math.abs(r - 13) < 22 && Math.abs(g - 27) < 22 && Math.abs(b - 42) < 22) navy++;
  // dourado #C5A059 (R>G>B, R medio-alto)
  else if (r > 140 && r < 235 && g > 110 && g < 200 && b < 140 && r > g && g > b) gold++;
  else if (r > 240 && g > 240 && b > 240) white++;
  else other++;
}
const total = info.width * info.height;
const pct = (v) => ((100 * v) / total).toFixed(1) + "%";
console.log("icon-512.png — distribuicao de pixels:");
console.log("  navy  (#0D1B2A) :", pct(navy), "(" + navy + ")");
console.log("  dourado (#C5A059):", pct(gold), "(" + gold + ")");
console.log("  transparente    :", pct(transparent), "(" + transparent + ")");
console.log("  branco          :", pct(white), "(" + white + ")");
console.log("  outros          :", pct(other), "(" + other + ")");

// Onde o dourado esta? bounding box
let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 10) continue;
    if (r > 140 && r < 235 && g > 110 && g < 200 && b < 140 && r > g && g > b) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
}
if (maxx >= 0) {
  console.log("  bbox dourado:", (maxx - minx + 1) + "x" + (maxy - miny + 1), "em", minx + "," + miny);
}

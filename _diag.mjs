// _diag.mjs (temporário) — descobre por que o fundo navy cobre o monograma
import sharp from "sharp";

const SRC = "public/images/brand/logo-monograma-dark.png";

// 1) O logo redimensionado preserva transparencia?
const solo = await sharp(SRC).resize(368, 368, {
  fit: "contain",
  background: { r: 0, g: 0, b: 0, alpha: 0 }
}).png().toBuffer();

const { data, info } = await sharp(solo).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
let transparent = 0, opaque = 0;
for (let i = 0; i < data.length; i += info.channels) {
  if (data[i + 3] < 10) transparent++; else opaque++;
}
console.log("logo redimensionado 368x368: transparente=" + transparent + " opaco=" + opaque);

// amostra do canto: deve ser transparente
const c = await sharp(solo).extract({ left: 1, top: 1, width: 1, height: 1 })
  .raw().toBuffer();
console.log("canto do logo redimensionado (esperado alfa 0):", [...c]);

// 2) O fundo navy arredondado esta correto?
const bg = await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 13, g: 27, b: 42, alpha: 1 } }
}).composite([{
  input: Buffer.from('<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="512" height="512" rx="113" ry="113" fill="#ffffff"/></svg>'),
  blend: "dest-in"
}]).png().toBuffer();
const bgc = await sharp(bg).extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer();
console.log("canto do fundo (esperado alfa 0):", [...bgc]);
const bgcent = await sharp(bg).extract({ left: 256, top: 256, width: 1, height: 1 }).raw().toBuffer();
console.log("centro do fundo (esperado 13,27,42,255):", [...bgcent]);

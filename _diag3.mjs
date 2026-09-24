// _diag3.mjs (temporario) — compara proporcao dourada do ORIGINAL vs do icone
import sharp from "sharp";

async function stats(label, input) {
  const { data, info } = await sharp(input).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  let navy = 0, gold = 0, other = 0, transp = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 10) { transp++; continue; }
    if (Math.abs(r - 13) < 25 && Math.abs(g - 27) < 25 && Math.abs(b - 42) < 25) navy++;
    else if (r > 130 && b < 150 && r > g && g >= b) gold++;
    else other++;
  }
  const ink = info.width * info.height - transp;
  console.log(
    label.padEnd(22) +
    " ink=" + String(ink).padEnd(8) +
    " navy=" + navy + " (" + ((100 * navy) / ink).toFixed(1) + "% da tinta)  " +
    "gold=" + gold + " (" + ((100 * gold) / ink).toFixed(1) + "%)  " +
    "other=" + other
  );
}

await stats("ORIGINAL 512", "public/images/brand/logo-monograma-dark.png");
await stats("logo 368 (so resize)", await sharp("public/images/brand/logo-monograma-dark.png")
  .resize(368, 368, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toBuffer());
await stats("ICONE gerado", "public/icon-512.png");

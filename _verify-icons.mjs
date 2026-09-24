// _verify-icons.mjs (temporário)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const files = [
  "favicon-32.png",
  "apple-icon.png",
  "icon-192.png",
  "icon-512.png"
];

for (const f of files) {
  const buf = fs.readFileSync(path.join("public", f));
  const m = await sharp(buf).metadata();
  console.log(
    f.padEnd(16) + String(m.width + "x" + m.height).padEnd(10) +
    String(m.format).padEnd(6) + (buf.length / 1024).toFixed(1) + " KB"
  );
}

const ico = fs.readFileSync(path.join("public", "favicon.ico"));
console.log("\n--- favicon.ico ---");
console.log("tipo=" + ico.readUInt16LE(2) + " (1=icone)  imagens=" + ico.readUInt16LE(4));
const n = ico.readUInt16LE(4);
for (let i = 0; i < n; i++) {
  const o = 6 + i * 16;
  let w = ico.readUInt8(o); if (w === 0) w = 256;
  let h = ico.readUInt8(o + 1); if (h === 0) h = 256;
  const len = ico.readUInt32LE(o + 8);
  const off = ico.readUInt32LE(o + 12);
  const sig = ico.subarray(off, off + 8).toString("hex");
  // valida que os bytes apontados sao mesmo um PNG decodificavel
  const meta = await sharp(ico.subarray(off, off + len)).metadata();
  console.log(
    "  #" + i + ": " + w + "x" + h + "  " + ico.readUInt16LE(o + 6) + "bpp  " +
    len + "B  sig=" + (sig === "89504e470d0a1a0a" ? "PNG ok" : "???") +
    "  decode=" + meta.width + "x" + meta.height
  );
}

// Amostra de pixels do centro + um canto (checa fundo navy e canto transparente)
const center = await sharp(path.join("public", "icon-512.png"))
  .extract({ left: 256, top: 256, width: 1, height: 1 }).raw().toBuffer();
console.log("\ncentro icon-512 (esperado tinta do monograma):", [...center.slice(0, 4)]);
const corner = await sharp(path.join("public", "icon-512.png"))
  .extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer();
console.log("canto (0,0) icon-512 (esperado alfa 0 = arredondado):", [...corner.slice(0, 4)]);

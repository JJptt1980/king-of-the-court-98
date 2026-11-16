// Writes launcher icons and splash images into the Android project from assets/emblem.png
// (made by scripts/make-emblem.mjs from the CLUTCH SQUAD logo).
import sharp from 'sharp';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
const R = 'android/app/src/main/res';
const EMBLEM = 'assets/emblem.png', BG = '#12191B';
const circle = s => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/2}"/></svg>`);
// Emblem with edges faded to transparent, so it sits on the flat background without a visible box.
const feather = async s => sharp(EMBLEM).resize(s, s).ensureAlpha().composite([{ input: Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><defs><radialGradient id="g" r="0.5"><stop offset="0.78" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${s}" height="${s}" fill="url(#g)"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
const dens = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, s] of Object.entries(dens)) {
  await sharp(EMBLEM).resize(s, s).png().toFile(`${R}/mipmap-${d}/ic_launcher.png`);
  await sharp(EMBLEM).resize(s, s).composite([{ input: circle(s), blend: 'dest-in' }]).png().toFile(`${R}/mipmap-${d}/ic_launcher_round.png`);
  // Adaptive icon: 108dp canvas, launcher masks to the middle ~72dp.
  const f = Math.round(s * 108 / 48), inner = Math.round(f * 0.70);
  await sharp({ create: { width: f, height: f, channels: 4, background: BG } })
    .composite([{ input: await feather(inner), gravity: 'center' }])
    .png().toFile(`${R}/mipmap-${d}/ic_launcher_foreground.png`);
}
writeFileSync(`${R}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG}</color>\n</resources>\n`);
for (const dir of readdirSync(R).filter(n => n.startsWith('drawable'))) {
  const p = `${R}/${dir}/splash.png`; if (!existsSync(p)) continue;
  const { width, height } = await sharp(p).metadata();
  const b = Math.round(Math.min(width, height) * 0.62);
  const buf = await sharp({ create: { width, height, channels: 3, background: BG } })
    .composite([{ input: await feather(b), gravity: 'center' }]).png().toBuffer();
  writeFileSync(p, buf);
}
console.log('android assets written');

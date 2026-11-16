// Builds the README illustrations in docs/images/ from the screenshots in docs/raw/
// (375x812 phone screenshots of the app with demo data) and assets/emblem.png.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const OUT = 'docs/images';
mkdirSync(OUT, { recursive: true });
const BG = '#12191B', GOLD = '#F5C400';
const shot = n => sharp(`docs/raw/${n}.jpg`).resize(375, 812).toBuffer();

// A phone screenshot as a 1-bit "window": black frame + hard offset shadow, on the dotted desk.
async function framed(name, { w = 375, h = 812, pad = 28, desk = true } = {}) {
  const img = await sharp(await shot(name)).resize(w, h).toBuffer();
  const W = w + pad * 2 + 8, H = h + pad * 2 + 8, b = 4;
  const deskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><pattern id="d" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#C9C9C9"/><circle cx="1" cy="1" r="0.9" fill="#ADADAD"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="${desk ? 'url(#d)' : 'none'}"/>
    <rect x="${pad + 8}" y="${pad + 8}" width="${w + b * 2}" height="${h + b * 2}" fill="#000"/>
    <rect x="${pad}" y="${pad}" width="${w + b * 2}" height="${h + b * 2}" fill="#000"/></svg>`;
  return sharp(Buffer.from(deskSvg)).composite([{ input: img, left: pad + b, top: pad + b }]).png();
}

for (const n of ['setup', 'game', 'win', 'summary']) await (await framed(n)).toFile(`${OUT}/screen-${n}.png`);

// Hero banner 1280x640
const W = 1280, H = 640;
const phone = async (n, h) => {
  const w = Math.round(375 * h / 812);
  const img = await sharp(await shot(n)).resize(w, h).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 18}" height="${h + 18}">
    <rect x="10" y="10" width="${w + 8}" height="${h + 8}" fill="#000"/>
    <rect x="0" y="0" width="${w + 8}" height="${h + 8}" fill="#F2F2F2"/></svg>`;
  return sharp(Buffer.from(svg)).composite([{ input: img, left: 4, top: 4 }]).png().toBuffer();
};
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><pattern id="g" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${BG}"/><circle cx="1" cy="1" r="0.8" fill="#1E282B"/></pattern>
  <pattern id="s" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="${GOLD}"/></pattern></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${GOLD}"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${GOLD}"/>
  <text x="64" y="372" font-family="PingFang TC" font-weight="600" font-size="80" fill="${GOLD}">單挑之王 98</text>
  <text x="66" y="424" font-family="PingFang TC" font-weight="600" font-size="30" fill="#FFFFFF">1 對 1 輪轉單挑・場邊記分板</text>
  <text x="66" y="470" font-family="PingFang TC" font-size="22" fill="#B8C0C2">進球留下，沒進下去。先到 12 分，就是球場之王。</text>
  <rect x="66" y="512" width="150" height="20" fill="url(#s)"/>
  ${['網頁版', 'Android', '離線可用', '免註冊'].map((t, i) => `<g transform="translate(${66 + i * 122},540)"><rect width="110" height="40" fill="none" stroke="${GOLD}" stroke-width="2"/><text x="55" y="27" text-anchor="middle" font-family="PingFang TC" font-weight="600" font-size="18" fill="#FFFFFF">${t}</text></g>`).join('')}
</svg>`;
const emblem = await sharp('assets/emblem.png').resize(250, 250).ensureAlpha().composite([{ input: Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250"><defs><radialGradient id="f" r="0.5"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="250" height="250" fill="url(#f)"/></svg>'), blend: 'dest-in' }]).png().toBuffer();
await sharp(Buffer.from(heroSvg)).composite([
  { input: emblem, left: 52, top: 40 },
  { input: await phone('summary', 470), left: 1020, top: 104 },
  { input: await phone('game', 500), left: 680, top: 70 },
  { input: await phone('win', 530), left: 840, top: 40 },
]).png().toFile(`${OUT}/hero.png`);
console.log('README images written to docs/images/');

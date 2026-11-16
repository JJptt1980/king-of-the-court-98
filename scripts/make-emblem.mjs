// Crops the CLUTCH SQUAD crest out of assets/logo.png into a square emblem on the logo's own
// dark background. Every icon (web, Android, header mark) is made from assets/emblem.png.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
export const BG = '#12191B';
const src = fileURLToPath(new URL('../assets/logo.png', import.meta.url));
const out = fileURLToPath(new URL('../assets/emblem.png', import.meta.url));
await sharp(src).extract({ left: 140, top: 0, width: 1156, height: 1024 })
  .extend({ top: 88, bottom: 88, left: 22, right: 22, extendWith: 'copy' })
  .png().toFile(out);
console.log('assets/emblem.png written');

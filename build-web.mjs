// Builds the standalone web app (www/) from the artifact page one folder up.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import sharp from 'sharp';

const src = readFileSync(new URL('./src/app.html', import.meta.url), 'utf8');
const title = (src.match(/<title>(.*?)<\/title>/) || [, '單挑之王'])[1];
const body = src.replace(/<title>.*?<\/title>\s*/, '');
const ver = Date.now().toString(36);

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });
writeFileSync('www/index.html', `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#12191B">
<title>${title}</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-64.png" type="image/png">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<script>window.KOTC_STANDALONE=true</script>
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
<script>
if ('serviceWorker' in navigator && !window.Capacitor && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(function(){});
}
</script>
</body>
</html>
`);

writeFileSync('www/manifest.webmanifest', JSON.stringify({
  name: '單挑之王 98', short_name: '單挑之王 98', lang: 'zh-Hant',
  start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: '#12191B', theme_color: '#12191B',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

writeFileSync('www/sw.js', `const C='kotc-${ver}';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-64.png','icon-192.png','icon-512.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(C).then(c=>c.put('./',cl));return r}).catch(()=>caches.match('./').then(h=>h||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
`);

const emblem = 'assets/emblem.png';
for (const n of [64, 192, 512]) await sharp(emblem).resize(n, n).png().toFile(`www/icon-${n}.png`);
console.log('www/ built');

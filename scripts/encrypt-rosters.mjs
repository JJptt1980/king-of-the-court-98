// Encrypts rosters.local.json ({"CODE": ["name", ...]}) into the ROSTER_VAULT block of src/app.html.
// Each roster is AES-GCM encrypted with a key derived from its code (PBKDF2-SHA256), so the
// names never appear in the published source; they only appear when someone types the code.
// rosters.local.json is git-ignored. Never commit it.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const SRC = new URL('../src/app.html', import.meta.url);
const LIST = new URL('../rosters.local.json', import.meta.url);
const ITER = 300000;
if (!existsSync(LIST)) { console.log('No rosters.local.json; leaving the vault empty.'); process.exit(0); }
const rosters = JSON.parse(readFileSync(LIST, 'utf8'));
const b64 = u => Buffer.from(u).toString('base64');
const te = new TextEncoder();
const vault = [];
for (const [code, names] of Object.entries(rosters)) {
  const c = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,24}$/.test(c)) throw new Error(`Code "${code}" must be 4-24 letters or digits`);
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey('raw', te.encode(c), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(names)));
  vault.push({ s: b64(salt), v: b64(iv), c: b64(new Uint8Array(ct)), i: ITER });
}
vault.sort(() => Math.random() - 0.5);
const html = readFileSync(SRC, 'utf8');
const out = html.replace(/const ROSTER_VAULT=\[[\s\S]*?\];/, 'const ROSTER_VAULT=' + JSON.stringify(vault) + ';');
if (out === html && vault.length) throw new Error('ROSTER_VAULT block not found');
writeFileSync(SRC, out);
console.log(`Encrypted ${vault.length} roster(s) into src/app.html`);

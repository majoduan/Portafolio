// Descarga subconjuntos (solo los glifos del título del hero) de las 20
// tipografías decorativas del efecto "typeface cycle".
//
// Antes: next/font/google traía cada familia COMPLETA (169 woff2 = 2,9 MB en
// el build, ≈ 500 KB descargados por visita al arrancar el ciclo) y ≈ 90 KB de
// CSS @font-face en cada página. El h1 solo muestra "Full-Stack Developer" /
// "Desarrollador Full-Stack": con `text=` Google Fonts devuelve un woff2 con
// esos glifos (+ alfabeto básico y acentos por si el título cambia): 2–6 KB
// por familia. Se cargan con next/font/local desde assets/fonts/hero/.
//
// Uso: node scripts/subset-hero-fonts.mjs   (requiere red; idempotente)

import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const OUT_DIR = resolve('assets/fonts/hero');
mkdirSync(OUT_DIR, { recursive: true });

// [familia, peso] — mismo orden/pesos que lib/heroFonts.js
const FAMILIES = [
  ['Bebas Neue', 400], ['Playfair Display', 700], ['Rye', 400], ['Monoton', 400],
  ['Pacifico', 400], ['Bungee', 400], ['Special Elite', 400], ['Orbitron', 700],
  ['Pirata One', 400], ['Abril Fatface', 400], ['Anton', 400], ['Lobster', 400],
  ['Creepster', 400], ['Megrim', 400], ['Shrikhand', 400], ['Faster One', 400],
  ['Vast Shadow', 400], ['Rampart One', 400], ['Permanent Marker', 400], ['Silkscreen', 400],
];

// Glifos: alfabeto, dígitos, puntuación habitual y acentos ES (título en EN/ES).
const TEXT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -–.,:/&+ÁÉÍÓÚÑÜáéíóúñü';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const slug = (family) => family.toLowerCase().replace(/[^a-z0-9]+/g, '-');

let total = 0;
for (const [family, weight] of FAMILIES) {
  const file = join(OUT_DIR, `${slug(family)}-${weight}.woff2`);
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${weight}&display=swap&text=${encodeURIComponent(TEXT)}`;
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
  const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
  if (!m) {
    console.error(`  ERROR ${family}: no woff2 url in CSS response`);
    console.error(css.slice(0, 300));
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(await (await fetch(m[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
  writeFileSync(file, buf);
  total += buf.length;
  console.log(`  OK ${family.padEnd(18)} ${String(buf.length).padStart(6)} bytes -> ${file.split(/[\\/]/).pop()}`);
}
console.log(`\nTotal: ${total} bytes en ${FAMILIES.length} familias (${(total / 1024).toFixed(1)} KB)`);
if (existsSync(OUT_DIR)) console.log('Dir:', OUT_DIR, statSync(OUT_DIR).isDirectory() ? '' : '(?)');

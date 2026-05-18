#!/usr/bin/env node

/**
 * Copia axe.min.js desde node_modules a public/dev/ para self-hosting.
 *
 * Por qué: el CSP del sitio solo permite scripts desde 'self' y prod.spline.design.
 * Cargar axe-core desde un CDN externo (cdnjs.cloudflare.com) se bloquea. La forma
 * de correr scans de a11y (manual via DevTools o automatizado en CI) es servirlo
 * desde el mismo origen.
 *
 * Uso:
 *   pnpm a11y:prepare         # copia axe.min.js a public/dev/
 *   pnpm dev                  # corre el servidor
 *   # en DevTools console:
 *   #   await fetch('/dev/axe.min.js').then(r => r.text()).then(eval);
 *   #   const results = await axe.run();
 *   #   console.log(results.violations);
 *
 * Para CI con Playwright:
 *   await page.addScriptTag({ url: '/dev/axe.min.js' });
 *   const results = await page.evaluate(() => axe.run());
 *
 * El archivo destino (public/dev/axe.min.js) está en .gitignore — se regenera
 * en cada workspace via este script. Mantener axe-core actualizado via pnpm
 * mantiene el archivo sincronizado.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'node_modules', 'axe-core', 'axe.min.js');
const destDir = path.join(root, 'public', 'dev');
const dest = path.join(destDir, 'axe.min.js');

if (!fs.existsSync(source)) {
  console.error(`❌ axe-core no encontrado en ${source}. Run 'pnpm install' first.`);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(source, dest);
const size = (fs.statSync(dest).size / 1024).toFixed(1);
console.log(`✓ axe.min.js -> public/dev/axe.min.js (${size} KB)`);

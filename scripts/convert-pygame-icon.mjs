// One-shot: el "pygame.svg" es en realidad un PNG raster embebido en base64
// dentro de un <pattern> SVG. svgo no puede reducir el payload base64.
// Lo convertimos a AVIF real de 128x128 (suficiente para h-20 = 80px con DPR 1.5).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const svgPath = resolve('public/media/tech/pygame.svg');
const outPath = resolve('public/media/tech/pygame.avif');

const svg = readFileSync(svgPath, 'utf8');
const match = svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (!match) {
  console.error('No se encontro PNG base64 embebido en pygame.svg');
  process.exit(1);
}
const pngBuffer = Buffer.from(match[1], 'base64');

const out = await sharp(pngBuffer)
  .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .avif({ quality: 70, effort: 6 })
  .toBuffer();

writeFileSync(outPath, out);
console.log(`pygame.avif: ${out.length} bytes (antes svg: ${svg.length} bytes)`);

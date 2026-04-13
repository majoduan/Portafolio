// Re-encode desktop project videos con h264 CRF 28 + +faststart.
// Compatibilidad universal (sin AV1). Objetivo: reducir ~30% sin perdida
// perceptible. Solo toca los .mp4 desktop (no los -mobile ni los posters).
// Swap destructivo solo si el archivo nuevo es mas pequeno.

import { execSync } from 'node:child_process';
import { readdirSync, statSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const videosDir = resolve('public/videos');
const files = readdirSync(videosDir)
  .filter((f) => f.endsWith('.mp4') && !f.endsWith('-mobile.mp4'));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const input = join(videosDir, file);
  const tmp = join(videosDir, `.reenc-${file}`);
  const beforeSize = statSync(input).size;
  totalBefore += beforeSize;

  if (existsSync(tmp)) unlinkSync(tmp);

  const cmd = [
    'ffmpeg -y -hide_banner -loglevel error',
    `-i "${input}"`,
    '-c:v libx264 -crf 28 -preset slow',
    '-c:a aac -b:a 96k',
    '-movflags +faststart',
    `"${tmp}"`,
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`  ERROR reencoding ${file}:`, err.message);
    if (existsSync(tmp)) unlinkSync(tmp);
    continue;
  }

  const afterSize = statSync(tmp).size;
  if (afterSize >= beforeSize) {
    // Re-encode no ayudo (video ya optimo): descartar tmp
    unlinkSync(tmp);
    totalAfter += beforeSize;
    const pct = ((afterSize - beforeSize) / beforeSize * 100).toFixed(1);
    console.log(`  SKIP  ${file}: ${beforeSize} -> ${afterSize} (${pct}%) [sin mejora, conservando original]`);
    continue;
  }

  renameSync(tmp, input);
  totalAfter += afterSize;
  const pct = ((afterSize - beforeSize) / beforeSize * 100).toFixed(1);
  console.log(`  OK    ${file}: ${beforeSize} -> ${afterSize} (${pct}%)`);
}

const savedPct = ((totalAfter - totalBefore) / totalBefore * 100).toFixed(1);
console.log(`\nTotal desktop: ${totalBefore} -> ${totalAfter} bytes (${savedPct}%)`);

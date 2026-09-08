// Re-encode desktop project videos con h264 CRF 28 + +faststart.
// Compatibilidad universal (sin AV1). Objetivo: reducir ~30% sin perdida
// perceptible. Solo toca los .mp4 desktop (no los -mobile ni los posters).
// Swap destructivo solo si el archivo nuevo es mas pequeno.
//
// Uso:
//   node scripts/reencode-desktop-videos.mjs                 # todos los desktop
//   node scripts/reencode-desktop-videos.mjs crumb-coach.mp4 # solo los indicados
//
// Si la fuente supera 720p se escala a 720p (el reproductor nunca supera
// ~700 px de ancho en desktop; 1080p solo cuesta bytes). Nunca se hace upscale.

import { execSync } from 'node:child_process';
import { readdirSync, statSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const videosDir = resolve('public/media/projects/videos');
const requested = process.argv.slice(2);
const files = requested.length
  ? requested
  : readdirSync(videosDir).filter((f) => f.endsWith('.mp4') && !f.endsWith('-mobile.mp4'));

const probeHeight = (input) => {
  try {
    const out = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${input}"`
    ).toString().trim();
    return parseInt(out, 10) || 0;
  } catch {
    return 0;
  }
};

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const input = join(videosDir, file);
  if (!existsSync(input)) {
    console.error(`  MISSING ${file}`);
    continue;
  }
  const tmp = join(videosDir, `.reenc-${file}`);
  const beforeSize = statSync(input).size;
  totalBefore += beforeSize;

  if (existsSync(tmp)) unlinkSync(tmp);

  const height = probeHeight(input);
  const scale = height > 720 ? '-vf scale=-2:720' : '';

  const cmd = [
    'ffmpeg -y -hide_banner -loglevel error',
    `-i "${input}"`,
    scale,
    '-c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p',
    '-c:a aac -b:a 128k',
    '-movflags +faststart',
    `"${tmp}"`,
  ].filter(Boolean).join(' ');

  console.log(`  ENCODE ${file} (${height}p${height > 720 ? ' -> 720p' : ''})`);
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

const savedPct = totalBefore ? ((totalAfter - totalBefore) / totalBefore * 100).toFixed(1) : '0.0';
console.log(`\nTotal: ${totalBefore} -> ${totalAfter} bytes (${savedPct}%)`);

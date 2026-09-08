// Genera una variante AV1 (.webm, audio Opus) de cada .mp4 de proyectos.
//
// AV1 rinde 30–50 % menos bytes que H.264 a igual calidad. Se sirve como primer
// <source> (Chrome/Edge/Firefox/Android); Safari sin AV1 cae al .mp4 (H.264).
// Es lossy sobre lossy, pero a CRF 34 con `tune=0` (VQ) la diferencia visual
// es imperceptible en un reproductor de ≤ 720 px.
//
// Escribe data/webm-manifest.json con los basenames que SÍ tienen .webm (si el
// AV1 no resulta más pequeño se descarta y el componente no lo ofrece).
//
// Uso: node scripts/generate-webm-av1.mjs [--force]

import { execSync } from 'node:child_process';
import { readdirSync, statSync, existsSync, unlinkSync, writeFileSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';

const videosDir = resolve('public/media/projects/videos');
const manifestPath = resolve('data/webm-manifest.json');
const force = process.argv.includes('--force');

const files = readdirSync(videosDir).filter((f) => f.endsWith('.mp4'));
const available = [];
let before = 0;
let after = 0;

for (const file of files) {
  const input = join(videosDir, file);
  const base = file.replace(/\.mp4$/, '');
  const output = join(videosDir, `${base}.webm`);
  const tmp = join(videosDir, `.av1-${base}.webm`);
  const mp4Size = statSync(input).size;
  before += mp4Size;

  if (!force && existsSync(output) && statSync(output).mtimeMs >= statSync(input).mtimeMs) {
    const s = statSync(output).size;
    after += s;
    available.push(base);
    console.log(`  SKIP  ${file} (webm al día, ${s} bytes)`);
    continue;
  }
  if (existsSync(tmp)) unlinkSync(tmp);

  const isMobile = base.endsWith('-mobile');
  const cmd = [
    'ffmpeg -y -hide_banner -loglevel error',
    `-i "${input}"`,
    '-c:v libsvtav1 -crf 34 -preset 6 -pix_fmt yuv420p -g 240 -svtav1-params tune=0',
    `-c:a libopus -b:a ${isMobile ? '64k' : '96k'}`,
    `"${tmp}"`,
  ].join(' ');

  console.log(`  ENCODE ${file}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`  ERROR ${file}:`, err.message);
    if (existsSync(tmp)) unlinkSync(tmp);
    after += mp4Size;
    continue;
  }

  const webmSize = statSync(tmp).size;
  if (webmSize >= mp4Size * 0.97) {
    unlinkSync(tmp);
    if (existsSync(output)) unlinkSync(output);
    after += mp4Size;
    console.log(`  DROP  ${file}: webm ${webmSize} no mejora mp4 ${mp4Size}`);
    continue;
  }
  renameSync(tmp, output);
  available.push(base);
  after += webmSize;
  const pct = ((webmSize - mp4Size) / mp4Size * 100).toFixed(1);
  console.log(`  OK    ${base}.webm: ${mp4Size} -> ${webmSize} (${pct}%)`);
}

available.sort();
writeFileSync(manifestPath, JSON.stringify(available, null, 2) + '\n');
console.log(`\nmp4 total ${before} -> webm/mp4 servido ${after} bytes (${((after - before) / before * 100).toFixed(1)}%)`);
console.log(`Manifest: ${manifestPath} (${available.length} con webm)`);

#!/usr/bin/env node
/**
 * Genera posters AVIF para los videos de proyectos.
 *
 * Para cada video desktop (excluye `-mobile.mp4`) en `public/media/projects/videos`,
 * extrae un frame con FFmpeg y lo convierte a AVIF en `public/media/projects/posters`
 * con el nombre `<base>-poster.avif` — la convención que espera
 * `utils/adaptiveVideo.js → getOptimalPoster()`.
 *
 * Requiere: FFmpeg en PATH + sharp (devDependency).
 *
 * Uso:
 *   node scripts/generate-posters.mjs                      # genera solo los que falten (idempotente)
 *   node scripts/generate-posters.mjs --force              # regenera todos
 *   node scripts/generate-posters.mjs --ss=2               # timestamp del frame en segundos (default 1)
 *   node scripts/generate-posters.mjs --video=crumb-coach.mp4  # procesar solo un video
 */

import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { readdirSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = join(__dirname, '..', 'public', 'media', 'projects', 'videos');
const POSTERS_DIR = join(__dirname, '..', 'public', 'media', 'projects', 'posters');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const ss = (argv.find((a) => a.startsWith('--ss=')) || '--ss=1').split('=')[1];
const onlyVideo = (argv.find((a) => a.startsWith('--video=')) || '--video=').split('=')[1] || null;

function hasFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!hasFFmpeg()) {
    console.error('❌ FFmpeg no está en PATH. Instálalo: https://ffmpeg.org/download.html');
    process.exit(1);
  }
  if (!existsSync(POSTERS_DIR)) mkdirSync(POSTERS_DIR, { recursive: true });

  let videos = readdirSync(VIDEOS_DIR).filter(
    (f) => f.endsWith('.mp4') && !f.endsWith('-mobile.mp4')
  );
  if (onlyVideo) videos = videos.filter((f) => f === onlyVideo);

  if (videos.length === 0) {
    console.log('ℹ️  No hay videos para procesar.');
    return;
  }

  let made = 0;
  let skipped = 0;

  for (const file of videos) {
    const base = basename(file, '.mp4');
    const videoPath = join(VIDEOS_DIR, file);
    const posterPath = join(POSTERS_DIR, `${base}-poster.avif`);
    const tmpPng = join(POSTERS_DIR, `.${base}-frame.png`);

    if (existsSync(posterPath) && !force) {
      console.log(`⏭️  Ya existe: ${base}-poster.avif`);
      skipped++;
      continue;
    }

    try {
      if (existsSync(tmpPng)) unlinkSync(tmpPng);
      // 1. Extraer un frame a PNG (seek rápido antes de -i).
      execSync(
        `ffmpeg -y -hide_banner -loglevel error -ss ${ss} -i "${videoPath}" -frames:v 1 "${tmpPng}"`,
        { stdio: 'inherit' }
      );
      // 2. PNG → AVIF (misma config que los posters existentes: quality 60, effort 6).
      await sharp(tmpPng).avif({ quality: 60, effort: 6 }).toFile(posterPath);
      unlinkSync(tmpPng);
      console.log(`✅ ${base}-poster.avif  (frame @ ${ss}s)`);
      made++;
    } catch (err) {
      console.error(`❌ Error con ${file}:`, err.message);
      if (existsSync(tmpPng)) unlinkSync(tmpPng);
    }
  }

  console.log(`\n🎬 Posters generados: ${made} · omitidos: ${skipped}`);
}

main();

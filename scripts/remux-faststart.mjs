// Remux sin recodificar (-c copy) para mover el atomo `moov` al inicio
// (+faststart). Sin faststart, `preload="metadata"` obliga al navegador a
// pedir el final del archivo antes de poder mostrar duracion/poster, y el
// arranque de reproduccion se retrasa. Es lossless: mismos bytes de video/audio.
//
// Uso: node scripts/remux-faststart.mjs   (procesa todos los .mp4 sin faststart)

import { execSync } from 'node:child_process';
import { readdirSync, openSync, readSync, closeSync, fstatSync, statSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const videosDir = resolve('public/media/projects/videos');

// Lee los atomos de nivel superior y devuelve true si `moov` precede a `mdat`.
const hasFaststart = (file) => {
  const fd = openSync(file, 'r');
  const size = fstatSync(fd).size;
  const buf = Buffer.alloc(16);
  const order = [];
  let off = 0;
  while (off < size && order.length < 8) {
    readSync(fd, buf, 0, 16, off);
    let atomSize = buf.readUInt32BE(0);
    const type = buf.toString('latin1', 4, 8);
    if (atomSize === 1) atomSize = Number(buf.readBigUInt64BE(8));
    if (atomSize === 0) atomSize = size - off;
    order.push(type);
    off += atomSize;
  }
  closeSync(fd);
  const moov = order.indexOf('moov');
  const mdat = order.indexOf('mdat');
  return moov !== -1 && mdat !== -1 && moov < mdat;
};

const files = readdirSync(videosDir).filter((f) => f.endsWith('.mp4'));
let fixed = 0;

for (const file of files) {
  const input = join(videosDir, file);
  if (hasFaststart(input)) {
    console.log(`  OK    ${file} (faststart ya presente)`);
    continue;
  }
  const tmp = join(videosDir, `.remux-${file}`);
  if (existsSync(tmp)) unlinkSync(tmp);
  try {
    execSync(
      `ffmpeg -y -hide_banner -loglevel error -i "${input}" -c copy -movflags +faststart "${tmp}"`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`  ERROR ${file}:`, err.message);
    if (existsSync(tmp)) unlinkSync(tmp);
    continue;
  }
  const before = statSync(input).size;
  const after = statSync(tmp).size;
  renameSync(tmp, input);
  fixed++;
  console.log(`  FIXED ${file}: ${before} -> ${after} bytes (moov al inicio)`);
}

console.log(`\n${fixed} archivo(s) remuxeado(s).`);

#!/usr/bin/env node
/**
 * Convierte SVGs de logos a AVIF de 120x120px
 * Requiere: ImageMagick (convert) o ffmpeg
 *
 * Uso: node scripts/convert-logos-to-avif.mjs
 */

import sharp from 'sharp';
import { execSync } from 'child_process';
import { readdir, mkdir, rmSync } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SVG_INPUT_DIR = join(__dirname, '../public/images/work-education');
const OUTPUT_DIR = join(__dirname, '../public/images/optimized');
const TEMP_DIR = join(__dirname, '../public/images/.temp-png');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function ensureDir(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

function svg2png(svgPath, pngPath) {
  try {
    // Intenta con ImageMagick primero
    execSync(`magick convert "${svgPath}" -background none -resize 120x120 "${pngPath}"`, {
      stdio: 'pipe',
    });
    return true;
  } catch (e) {
    try {
      // Fallback a ffmpeg
      execSync(`ffmpeg -i "${svgPath}" -vf scale=120:120 -y "${pngPath}"`, {
        stdio: 'pipe',
      });
      return true;
    } catch (e2) {
      console.error(
        `${colors.red}✗${colors.reset} No se pudo convertir ${basename(svgPath)}. ` +
        `Instala ImageMagick o ffmpeg.\n` +
        `  Windows (Chocolatey): choco install imagemagick\n` +
        `  Windows (WSL): apt-get install imagemagick\n` +
        `  macOS (Homebrew): brew install imagemagick`
      );
      return false;
    }
  }
}

async function convertLogos() {
  console.log(`${colors.blue}📸 Convirtiendo logos SVG a AVIF...${colors.reset}\n`);

  try {
    await ensureDir(OUTPUT_DIR);
    await ensureDir(TEMP_DIR);

    const files = await readdir(SVG_INPUT_DIR);
    const svgFiles = files.filter((f) => f.endsWith('.svg'));

    if (svgFiles.length === 0) {
      console.log(`${colors.yellow}⚠ No se encontraron archivos SVG en ${SVG_INPUT_DIR}${colors.reset}`);
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const svgFile of svgFiles) {
      const svgPath = join(SVG_INPUT_DIR, svgFile);
      const basename_ = basename(svgFile, '.svg');
      const pngPath = join(TEMP_DIR, `${basename_}.png`);
      const avifPath = join(OUTPUT_DIR, `${basename_}-120w.avif`);

      try {
        // 1. SVG → PNG (120x120)
        process.stdout.write(`  ${colors.yellow}●${colors.reset} ${svgFile} → PNG... `);
        if (!svg2png(svgPath, pngPath)) {
          failureCount++;
          console.log(`${colors.red}✗${colors.reset}`);
          continue;
        }
        console.log(`${colors.green}✓${colors.reset}`);

        // 2. PNG → AVIF
        process.stdout.write(`  ${colors.yellow}●${colors.reset} PNG → ${basename_}-120w.avif... `);
        await sharp(pngPath)
          .avif({ quality: 60, effort: 6 })
          .toFile(avifPath);
        console.log(`${colors.green}✓${colors.reset}`);
        successCount++;
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${error.message}`);
        failureCount++;
      }
    }

    // Limpia temp
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    console.log(`\n${colors.green}✓ Convertidos: ${successCount}/${svgFiles.length}${colors.reset}`);
    if (failureCount > 0) {
      console.log(`${colors.red}✗ Fallos: ${failureCount}${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.blue}✨ Logos AVIF listos en:${colors.reset}`);
    console.log(`   ${OUTPUT_DIR}`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

convertLogos();

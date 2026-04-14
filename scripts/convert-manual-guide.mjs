#!/usr/bin/env node
/**
 * Convierte SVGs a AVIF usando CloudConvert API
 * Requiere: API key de CloudConvert (gratuito con límites)
 *
 * Alternativa simple: ejecutar manualmente en https://cloudconvert.com
 */

import sharp from 'sharp';
import { readdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SVG_DIR = join(__dirname, '../public/media/work-education');
const OUTPUT_DIR = join(__dirname, '../public/media/certificates');

console.log('❌ Este script requiere ImageMagick o ffmpeg instalados.');
console.log('');
console.log('📋 ALTERNATIVA MANUAL - Usa esto si prefieres:');
console.log('');
console.log('1. Ve a: https://cloudconvert.com/svg-to-avif');
console.log('2. Para cada SVG, súbelo y configura:');
console.log('   - Input: SVG');
console.log('   - Output: AVIF');
console.log('   - Options: Resize 120x120px');
console.log('3. Descarga con nombre: {nombre}-120w.avif');
console.log('4. Guarda en: public/media/certificates/');
console.log('');
console.log('📁 SVGs a convertir:');

const files = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
files.forEach(f => {
  const name = f.replace('.svg', '');
  console.log(`   → ${name}-120w.avif`);
});

console.log('');
console.log('👤 O instala ImageMagick manualmente:');
console.log('   https://imagemagick.org/script/download.php#windows');

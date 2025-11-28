#!/usr/bin/env node
/**
 * Script para generar versiones responsive de imágenes WebP
 * Genera múltiples tamaños para srcset
 * 
 * Uso: node scripts/generate-responsive-images.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir, access } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const SIZES = [400, 800, 1200, 1920];
const QUALITY = 85;
const INPUT_DIRS = [
  join(__dirname, '../public/images'),
  join(__dirname, '../public/images/certificates')
];
const OUTPUT_DIR = join(__dirname, '../public/images/optimized');

// Colores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function ensureDir(dir) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
    console.log(`${colors.blue}📁 Directorio creado: ${dir}${colors.reset}`);
  }
}

async function generateResponsiveVersions(inputPath, outputDir) {
  const filename = basename(inputPath, extname(inputPath));
  const ext = extname(inputPath);
  
  if (ext.toLowerCase() !== '.webp') {
    return;
  }

  console.log(`\n${colors.blue}🖼️  Procesando: ${filename}${colors.reset}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    for (const size of SIZES) {
      // No generar si la imagen es más pequeña que el tamaño objetivo
      if (metadata.width < size) {
        console.log(`  ${colors.yellow}⏭️  Saltando ${size}w (imagen original: ${metadata.width}px)${colors.reset}`);
        continue;
      }

      const outputPath = join(outputDir, `${filename}-${size}w.webp`);
      
      await sharp(inputPath)
        .resize(size, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: QUALITY,
          effort: 6 // Balance entre velocidad y compresión
        })
        .toFile(outputPath);
      
      const stats = await sharp(outputPath).metadata();
      const fileSize = (stats.size / 1024).toFixed(2);
      console.log(`  ${colors.green}✓${colors.reset} ${size}w → ${fileSize} KB`);
    }
    
    console.log(`${colors.green}✅ Completado: ${filename}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error procesando ${filename}: ${error.message}${colors.reset}`);
  }
}

async function processDirectory(inputDir, outputDir) {
  try {
    const files = await readdir(inputDir);
    
    for (const file of files) {
      const inputPath = join(inputDir, file);
      await generateResponsiveVersions(inputPath, outputDir);
    }
  } catch (error) {
    console.error(`${colors.red}Error procesando directorio ${inputDir}: ${error.message}${colors.reset}`);
  }
}

async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════╗
║   🖼️  Generador de Imágenes Responsive                ║
║   Creando versiones optimizadas para srcset           ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Crear directorio de salida
  await ensureDir(OUTPUT_DIR);

  // Procesar cada directorio
  for (const inputDir of INPUT_DIRS) {
    console.log(`\n${colors.blue}📂 Procesando directorio: ${inputDir}${colors.reset}`);
    try {
      await processDirectory(inputDir, OUTPUT_DIR);
    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.green}
╔════════════════════════════════════════════════════════╗
║   ✅ Proceso completado exitosamente                  ║
║   📁 Imágenes guardadas en: /public/images/optimized  ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`\n${colors.yellow}💡 Próximo paso:${colors.reset}`);
  console.log(`   Actualiza tus componentes para usar srcset:`);
  console.log(`${colors.blue}
   <img
     src="/images/optimized/foto-perfil-800w.webp"
     srcSet="
       /images/optimized/foto-perfil-400w.webp 400w,
       /images/optimized/foto-perfil-800w.webp 800w,
       /images/optimized/foto-perfil-1200w.webp 1200w,
       /images/optimized/foto-perfil-1920w.webp 1920w
     "
     sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
     alt="..."
     width="800"
     height="1000"
   />
${colors.reset}`);
}

main().catch(console.error);

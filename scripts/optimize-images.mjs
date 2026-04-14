// ============================================
// 🖼️ Script de Optimización de Imágenes
// ============================================
// Convierte JPG/PNG a WebP con Sharp
// Reducción esperada: ~70% del tamaño original
// ============================================

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración
const CONFIG = {
  inputDir: path.join(__dirname, '../public/media/certificates'),
  outputDir: path.join(__dirname, '../public/media/certificates/webp'),
  quality: 85, // Calidad WebP (0-100)
  effort: 6,   // Esfuerzo de compresión (0-6, más alto = mejor compresión)
  supportedFormats: /\.(jpg|jpeg|png)$/i
};

// Colores para console
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

// Helper para formatear tamaños
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Crear directorio de salida
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

async function optimizeImages() {
  console.log(`\n${colors.cyan}${colors.bold}🖼️  IMAGE OPTIMIZER TO WEBP${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}\n`);

  // Verificar directorio de entrada
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.error(`${colors.red}❌ ERROR: Directorio '${CONFIG.inputDir}' no existe${colors.reset}\n`);
    process.exit(1);
  }

  // Obtener archivos
  const files = fs.readdirSync(CONFIG.inputDir)
    .filter(f => CONFIG.supportedFormats.test(f));

  if (files.length === 0) {
    console.log(`${colors.yellow}⚠️  No se encontraron imágenes JPG/PNG en '${CONFIG.inputDir}'${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.green}📸 Imágenes encontradas: ${files.length}${colors.reset}`);
  console.log(`${colors.cyan}⚙️  Configuración:${colors.reset}`);
  console.log(`${colors.gray}   - Calidad WebP: ${CONFIG.quality}${colors.reset}`);
  console.log(`${colors.gray}   - Esfuerzo de compresión: ${CONFIG.effort}/6${colors.reset}\n`);

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const inputPath = path.join(CONFIG.inputDir, file);
    const outputFile = file.replace(CONFIG.supportedFormats, '.webp');
    const outputPath = path.join(CONFIG.outputDir, outputFile);

    console.log(`${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}📸 ${file}${colors.reset}`);

    try {
      // Obtener información original
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;
      totalOriginalSize += originalSize;

      console.log(`   ${colors.cyan}📊 Tamaño original: ${formatBytes(originalSize)}${colors.reset}`);
      console.log(`   ${colors.yellow}🔄 Convirtiendo a WebP...${colors.reset}`);

      const startTime = Date.now();

      // Convertir a WebP
      await sharp(inputPath)
        .webp({
          quality: CONFIG.quality,
          effort: CONFIG.effort
        })
        .toFile(outputPath);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Obtener tamaño nuevo
      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      totalNewSize += newSize;

      const savedBytes = originalSize - newSize;
      const reduction = ((savedBytes / originalSize) * 100).toFixed(1);
      const compressionRatio = (originalSize / newSize).toFixed(2);

      console.log(`   ${colors.green}✅ COMPLETADO en ${processingTime}s${colors.reset}`);
      console.log(`   ${colors.green}📊 Nuevo tamaño: ${formatBytes(newSize)} (-${reduction}% | ${compressionRatio}x)${colors.reset}`);
      console.log(`   ${colors.gray}💾 ${outputFile}${colors.reset}`);

      successCount++;
    } catch (error) {
      console.log(`   ${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
      failCount++;
    }

    console.log('');
  }

  // Resumen final
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}📊 RESUMEN FINAL${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.green}✅ Imágenes procesadas: ${successCount}/${files.length}${colors.reset}`);
  
  if (failCount > 0) {
    console.log(`${colors.red}❌ Fallos: ${failCount}${colors.reset}`);
  }

  const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
  const savedSpace = totalOriginalSize - totalNewSize;

  console.log(`\n${colors.cyan}📦 Tamaño total:${colors.reset}`);
  console.log(`   Original:  ${formatBytes(totalOriginalSize)}`);
  console.log(`   ${colors.green}Optimizado: ${formatBytes(totalNewSize)}${colors.reset}`);
  console.log(`   ${colors.yellow}Reducción:  ${formatBytes(savedSpace)} (-${totalReduction}%)${colors.reset}`);

  console.log(`\n${colors.cyan}📁 Imágenes WebP guardadas en:${colors.reset}`);
  console.log(`   ${CONFIG.outputDir}`);

  console.log(`\n${colors.yellow}⚠️  SIGUIENTE PASO:${colors.reset}`);
  console.log(`   ${colors.gray}1. Revisa la calidad de las imágenes WebP${colors.reset}`);
  console.log(`   ${colors.gray}2. Actualiza las rutas en src/data/projects.js:${colors.reset}`);
  console.log(`   ${colors.gray}   image: "/images/certificates/webp/nombre.webp"${colors.reset}`);
  console.log(`   ${colors.gray}3. Opcional: Implementa <picture> para fallback${colors.reset}`);

  console.log(`\n${colors.green}✨ Script completado!${colors.reset}\n`);
}

// Ejecutar
optimizeImages().catch(err => {
  console.error(`\n${colors.red}❌ Error fatal: ${err.message}${colors.reset}\n`);
  process.exit(1);
});

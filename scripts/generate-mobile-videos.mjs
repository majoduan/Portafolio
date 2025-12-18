#!/usr/bin/env node

/**
 * Script para generar versiones mobile (480p) de los videos
 * Requiere FFmpeg instalado: https://ffmpeg.org/download.html
 * 
 * Uso:
 *   node scripts/generate-mobile-videos.mjs
 *   node scripts/generate-mobile-videos.mjs --video=path/to/video.mp4
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

// Configuración
const VIDEO_DIR = './public/videos';
const MOBILE_SUFFIX = '-mobile.mp4';

// Parámetros de conversión
const MOBILE_CONFIG = {
  scale: '-2:480', // Mantener aspect ratio, altura 480p
  crf: '28',       // Calidad (18-28, mayor = menor calidad/tamaño)
  preset: 'fast',  // Velocidad de encoding
  codec: 'libx264' // H.264 (mejor compatibilidad)
};

/**
 * Verifica si FFmpeg está instalado
 */
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg no está instalado.');
    console.error('📥 Descárgalo desde: https://ffmpeg.org/download.html');
    console.error('💡 Windows: Agregar a PATH o usar choco install ffmpeg');
    return false;
  }
}

/**
 * Obtiene todos los videos en el directorio
 */
function getVideoFiles(dir) {
  const files = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isFile() && extname(entry) === '.mp4' && !entry.includes(MOBILE_SUFFIX)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error leyendo directorio ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Convierte un video a versión mobile
 */
function convertToMobile(inputPath) {
  const fileName = basename(inputPath, '.mp4');
  const outputPath = inputPath.replace('.mp4', MOBILE_SUFFIX);
  
  // Verificar si ya existe
  if (existsSync(outputPath)) {
    console.log(`⏭️  Ya existe: ${basename(outputPath)}`);
    return true;
  }
  
  console.log(`🎬 Convirtiendo: ${basename(inputPath)}`);
  console.log(`   → ${basename(outputPath)}`);
  
  const command = `ffmpeg -i "${inputPath}" -vf scale=${MOBILE_CONFIG.scale} -c:v ${MOBILE_CONFIG.codec} -crf ${MOBILE_CONFIG.crf} -preset ${MOBILE_CONFIG.preset} -c:a aac -b:a 128k "${outputPath}"`;
  
  try {
    const startTime = Date.now();
    execSync(command, { stdio: 'inherit' });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`✅ Completado en ${duration}s`);
    
    // Mostrar tamaños
    const originalSize = (statSync(inputPath).size / 1024 / 1024).toFixed(2);
    const mobileSize = (statSync(outputPath).size / 1024 / 1024).toFixed(2);
    const reduction = (((originalSize - mobileSize) / originalSize) * 100).toFixed(1);
    
    console.log(`   📊 Original: ${originalSize} MB → Mobile: ${mobileSize} MB (↓${reduction}%)`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${basename(inputPath)}:`, error.message);
    return false;
  }
}

/**
 * Main
 */
function main() {
  console.log('🎥 Generador de Videos Mobile (480p)');
  console.log('=====================================\n');
  
  // Verificar FFmpeg
  if (!checkFFmpeg()) {
    process.exit(1);
  }
  
  // Verificar directorio
  if (!existsSync(VIDEO_DIR)) {
    console.error(`❌ Directorio no encontrado: ${VIDEO_DIR}`);
    process.exit(1);
  }
  
  // Obtener videos
  const videos = getVideoFiles(VIDEO_DIR);
  
  if (videos.length === 0) {
    console.log(`ℹ️  No se encontraron videos en ${VIDEO_DIR}`);
    return;
  }
  
  console.log(`📁 Encontrados ${videos.length} videos\n`);
  
  // Convertir cada video
  let successCount = 0;
  let errorCount = 0;
  
  for (const video of videos) {
    if (convertToMobile(video)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Resumen
  console.log('=====================================');
  console.log(`✅ Conversiones exitosas: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errores: ${errorCount}`);
  }
  console.log('\n💡 Tip: Verifica los videos mobile en tu navegador para confirmar calidad');
}

// Ejecutar
main();

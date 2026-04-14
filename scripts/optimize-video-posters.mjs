import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VIDEOS_DIR = join(__dirname, '..', 'public', 'videos');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🎬 Optimizador de Posters de Video                  ║');
console.log('║   Convirtiendo JPG → WebP con compresión optimizada   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

async function optimizePosters() {
  try {
    const files = await readdir(VIDEOS_DIR);
    const posterFiles = files.filter(file => file.endsWith('-poster.jpg'));
    
    if (posterFiles.length === 0) {
      console.log('⚠️  No se encontraron posters JPG para optimizar');
      return;
    }

    console.log(`📁 Encontrados ${posterFiles.length} posters para optimizar\n`);

    for (const posterFile of posterFiles) {
      const inputPath = join(VIDEOS_DIR, posterFile);
      const outputFile = posterFile.replace('-poster.jpg', '-poster.webp');
      const outputPath = join(VIDEOS_DIR, outputFile);

      try {
        const startTime = Date.now();
        
        // Obtener tamaño original
        const originalStats = await sharp(inputPath).metadata();
        
        // Convertir a WebP con calidad 85 (balance perfecto)
        await sharp(inputPath)
          .webp({ 
            quality: 85,
            effort: 6 // Máxima compresión sin sacrificar velocidad
          })
          .toFile(outputPath);

        // Obtener tamaño optimizado
        const optimizedStats = await sharp(outputPath).metadata();
        
        const reduction = ((1 - (optimizedStats.size / originalStats.size)) * 100).toFixed(1);
        const duration = Date.now() - startTime;
        
        console.log(`✅ ${basename(posterFile)}`);
        console.log(`   ${originalStats.width}x${originalStats.height} → WebP`);
        console.log(`   ${(originalStats.size / 1024).toFixed(0)} KB → ${(optimizedStats.size / 1024).toFixed(0)} KB (-${reduction}%)`);
        console.log(`   ⏱️  ${duration}ms\n`);
      } catch (error) {
        console.error(`❌ Error procesando ${posterFile}:`, error.message);
      }
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Optimización completada                          ║');
    console.log('║   📁 Posters WebP guardados en: /public/media/projects/videos        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('💡 Siguiente paso:');
    console.log('   Los posters WebP están listos. Los JPG originales pueden');
    console.log('   eliminarse después de verificar que todo funciona.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

optimizePosters();

# 🎬 Guía de Optimización de Medios

## 📊 Análisis Actual

### Videos (Problema Crítico)
```
Total: 99.29 MB
├── epn-certificates.mp4    20.67 MB  ⚠️ MUY PESADO
├── godot-game-2d.mp4       14.84 MB
├── space-invaders.mp4      14.64 MB
├── storycraft.mp4          14.73 MB
├── travel-allowance.mp4    13.37 MB
├── godot-game-3d.mp4       13.20 MB
├── fitness-tracker.mp4      7.84 MB
└── (poa-management.mp4 - falta)
```

### Imágenes (Optimizable)
```
Total: 4.25 MB
├── scrum-foundation.jpg      1.41 MB
├── cisco-networking.jpg      1.25 MB
├── epn-award.jpg             862 KB
└── digital-transformation.jpg 726 KB
```

---

## 🎯 Objetivos de Optimización

| Tipo | Actual | Meta | Reducción |
|------|--------|------|-----------|
| **Videos** | 99 MB | 35-40 MB | **-60%** |
| **Imágenes** | 4.25 MB | 1.2 MB | **-72%** |
| **Total** | 103 MB | 36-41 MB | **-65%** |

---

## 🛠️ PASO 1: Optimizar Videos con FFmpeg

### Instalación de FFmpeg

**Windows:**
```powershell
# Opción 1: Con winget (Windows 10/11)
winget install ffmpeg

# Opción 2: Con Chocolatey
choco install ffmpeg

# Opción 3: Manual
# Descarga desde: https://ffmpeg.org/download.html
# Agrega al PATH: C:\ffmpeg\bin
```

**Verificar instalación:**
```powershell
ffmpeg -version
```

### Comando de Optimización de Video

**Configuración Recomendada (Web-Optimized):**
```powershell
# Plantilla base
ffmpeg -i input.mp4 `
  -c:v libx264 `
  -preset slow `
  -crf 25 `
  -vf "scale=1280:720" `
  -movflags +faststart `
  -pix_fmt yuv420p `
  -c:a aac `
  -b:a 128k `
  output.mp4
```

**Explicación de parámetros:**
- `-c:v libx264`: Codec H.264 (compatible con todos los navegadores)
- `-preset slow`: Mejor compresión (tarda más pero reduce tamaño)
- `-crf 25`: Calidad (18=alta, 23=media-alta, 28=media) - 25 es ideal para web
- `-vf "scale=1280:720"`: Resolución HD (suficiente para portfolio)
- `-movflags +faststart`: Permite streaming progresivo
- `-pix_fmt yuv420p`: Máxima compatibilidad
- `-b:a 128k`: Audio optimizado

### Script PowerShell Automatizado

Crea `optimize-videos.ps1` en la carpeta `scripts/`:

```powershell
# scripts/optimize-videos.ps1
$inputDir = "public/videos"
$outputDir = "public/videos/optimized"

# Crear directorio de salida
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Obtener todos los MP4
$videos = Get-ChildItem "$inputDir/*.mp4" -File

Write-Host "🎬 Optimizando $($videos.Count) videos..." -ForegroundColor Cyan

foreach ($video in $videos) {
    Write-Host "`n📹 Procesando: $($video.Name)" -ForegroundColor Yellow
    
    $inputPath = $video.FullName
    $outputPath = Join-Path $outputDir $video.Name
    
    # Obtener tamaño original
    $originalSize = [math]::Round($video.Length / 1MB, 2)
    Write-Host "   Tamaño original: ${originalSize} MB"
    
    # Optimizar con FFmpeg
    ffmpeg -i $inputPath `
        -c:v libx264 `
        -preset slow `
        -crf 25 `
        -vf "scale=1280:720" `
        -movflags +faststart `
        -pix_fmt yuv420p `
        -c:a aac `
        -b:a 128k `
        -y `
        $outputPath
    
    # Calcular reducción
    if (Test-Path $outputPath) {
        $newSize = [math]::Round((Get-Item $outputPath).Length / 1MB, 2)
        $reduction = [math]::Round((($originalSize - $newSize) / $originalSize) * 100, 1)
        
        Write-Host "   ✅ Nuevo tamaño: ${newSize} MB (-${reduction}%)" -ForegroundColor Green
    }
}

Write-Host "`n✨ Optimización completada!" -ForegroundColor Green
Write-Host "📁 Videos optimizados en: $outputDir" -ForegroundColor Cyan
Write-Host "`n⚠️  IMPORTANTE: Revisa los videos antes de reemplazar los originales" -ForegroundColor Yellow
```

**Uso:**
```powershell
cd "c:\Users\Mateo\Desktop\9no Semestre\mateo-portfolio"
.\scripts\optimize-videos.ps1
```

---

## 🖼️ PASO 2: Convertir Imágenes a WebP

### Instalación de cwebp (Google)

**Windows:**
```powershell
# Descarga: https://developers.google.com/speed/webp/download
# O usa Sharp con Node.js (recomendado)

npm install -g sharp-cli
```

### Comando de Conversión

**Con Sharp (Node.js):**
```powershell
# Instalar Sharp en el proyecto
npm install --save-dev sharp

# Crear script de conversión (ver abajo)
```

### Script Node.js para Convertir a WebP

Crea `optimize-images.mjs` en `scripts/`:

```javascript
// scripts/optimize-images.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, '../public/images/certificates');
const outputDir = path.join(__dirname, '../public/images/certificates/webp');

// Crear directorio de salida
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertToWebP() {
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`🖼️  Convirtiendo ${files.length} imágenes a WebP...\n`);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    const stats = fs.statSync(inputPath);
    const originalSize = (stats.size / 1024).toFixed(2);
    
    console.log(`📸 ${file}`);
    console.log(`   Original: ${originalSize} KB`);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);
      
      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024).toFixed(2);
      const reduction = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);
      
      console.log(`   WebP: ${newSize} KB (-${reduction}%)`);
      console.log(`   ✅ Guardado en: ${path.basename(outputPath)}\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('✨ Conversión completada!');
}

convertToWebP();
```

**Uso:**
```powershell
# Instalar dependencia
npm install --save-dev sharp

# Ejecutar conversión
node scripts/optimize-images.mjs
```

---

## 🔄 PASO 3: Actualizar Código para Usar WebP

Actualiza `src/data/projects.js`:

```javascript
export const certificates = [
  { 
    title: "EPN Academic Excellence Award", 
    org: "Escuela Politécnica Nacional", 
    icon: "🏆", 
    image: "/images/certificates/webp/epn-award.webp" // Cambiar a .webp
  },
  // ... resto de certificados con .webp
];
```

---

## 📝 PASO 4: Implementar Picture Element (Fallback)

Para máxima compatibilidad, usa `<picture>`:

```jsx
<picture>
  <source srcSet="/images/certificates/webp/epn-award.webp" type="image/webp" />
  <img src="/images/certificates/epn-award.jpg" alt="Award" loading="lazy" />
</picture>
```

---

## 🚀 Resultados Esperados

### Antes de Optimización
```
Carga inicial:     103 MB
Tiempo de carga:   25-30 segundos (4G)
FCP:               2.8s
Modal delay:       5-10s por video
```

### Después de Optimización
```
Carga inicial:     36-41 MB (-65%)
Tiempo de carga:   8-12 segundos (4G)  ⚡ -70%
FCP:               1.4s                ✅ Mantenido
Modal delay:       0.5-2s por video    ⚡ -80%
```

---

## ✅ Checklist de Optimización

### Videos
- [ ] Instalar FFmpeg
- [ ] Ejecutar `optimize-videos.ps1`
- [ ] Revisar calidad de videos optimizados
- [ ] Reemplazar videos originales con optimizados
- [ ] Verificar reproducción en navegador

### Imágenes
- [ ] Instalar Sharp: `npm install --save-dev sharp`
- [ ] Ejecutar `optimize-images.mjs`
- [ ] Revisar calidad de imágenes WebP
- [ ] Actualizar rutas en `projects.js`
- [ ] Verificar carga en navegador

### Testing
- [ ] Build de producción: `npm run build`
- [ ] Verificar tamaño del bundle
- [ ] Test de carga con DevTools
- [ ] Verificar modal de videos (velocidad de apertura)
- [ ] Lighthouse audit (target: >92)

---

## 🎯 Comandos Rápidos

```powershell
# Optimización completa (ejecutar en orden)
cd "c:\Users\Mateo\Desktop\9no Semestre\mateo-portfolio"

# 1. Videos
.\scripts\optimize-videos.ps1

# 2. Imágenes
npm install --save-dev sharp
node scripts\optimize-images.mjs

# 3. Build y test
npm run build
npm run preview
```

---

## 📚 Recursos Adicionales

- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **Sharp Docs**: https://sharp.pixelplumbing.com/
- **WebP Guide**: https://developers.google.com/speed/webp
- **Video Optimization**: https://web.dev/fast/#optimize-your-videos

---

## ⚠️ IMPORTANTE

1. **Backup**: Haz copia de seguridad de videos/imágenes originales antes de optimizar
2. **Calidad**: Revisa cada video optimizado para asegurar calidad aceptable
3. **Git**: No commitees videos pesados - usa Git LFS o almacena en CDN
4. **CDN**: Considera usar Cloudflare/Vercel para servir videos (mejor performance)

---

*Última actualización: Noviembre 2025*

# 🛠️ Scripts de Optimización - Portfolio

Esta carpeta contiene scripts automatizados para optimizar el performance del portfolio.

## 📋 Scripts Disponibles

### 1. `optimize-videos.ps1` - Optimización de Videos

**Propósito**: Comprimir videos MP4 para web usando FFmpeg.

**Uso:**
```powershell
# Dry run (ver qué se haría sin procesar)
.\scripts\optimize-videos.ps1 -DryRun

# Procesar todos los videos
.\scripts\optimize-videos.ps1

# Configuración personalizada
.\scripts\optimize-videos.ps1 -CRF 28 -Resolution "1920:1080"
```

**Parámetros:**
- `-InputDir`: Directorio de entrada (default: `public/videos`)
- `-OutputDir`: Directorio de salida (default: `public/videos/optimized`)
- `-CRF`: Calidad (18=alta, 23=media-alta, 28=media) (default: 25)
- `-Resolution`: Resolución de salida (default: `1280:720`)
- `-DryRun`: Simular sin procesar archivos

**Resultado esperado:** -60% tamaño de videos

---

### 2. `optimize-images.mjs` - Conversión a WebP

**Propósito**: Convertir imágenes JPG/PNG a WebP usando Sharp.

**Pre-requisito:**
```powershell
npm install --save-dev sharp
```

**Uso:**
```powershell
node scripts/optimize-images.mjs
```

**Resultado esperado:** -70% tamaño de imágenes

---

### 3. `analyze-bundle.mjs` - Análisis de Bundle

**Propósito**: Analizar el build de producción y generar reporte.

**Uso:**
```powershell
# Primero hacer build
npm run build

# Luego analizar
node scripts/analyze-bundle.mjs
```

**Output:**
- Resumen de tamaños por tipo (JS, CSS, Images, Videos)
- Top 10 archivos más grandes
- Warnings de performance
- Recomendaciones
- Estimación de Core Web Vitals

---

## 🚀 Workflow Completo

### Paso 1: Analizar Estado Actual

```powershell
# Build actual
npm run build

# Ver estado actual
node scripts/analyze-bundle.mjs
```

### Paso 2: Optimizar Videos

```powershell
# Verificar que FFmpeg está instalado
ffmpeg -version

# Optimizar videos
.\scripts\optimize-videos.ps1

# Revisar calidad de videos optimizados
# Abrir: public/videos/optimized/

# Si todo está bien, reemplazar
Move-Item 'public/videos/optimized/*.mp4' 'public/videos/' -Force
```

### Paso 3: Optimizar Imágenes

```powershell
# Instalar Sharp si no está
npm install --save-dev sharp

# Convertir a WebP
node scripts/optimize-images.mjs

# Actualizar rutas en código
# Editar: src/data/projects.js
# Cambiar: .jpg → .webp
```

### Paso 4: Verificar Mejoras

```powershell
# Nuevo build
npm run build

# Analizar mejoras
node scripts/analyze-bundle.mjs

# Preview
npm run preview
```

---

## 📊 Métricas Esperadas

### Antes de Optimización

```
📦 Bundle Size Summary:
  JS         280 KB (27%)
  CSS         50 KB (5%)
  IMAGES    4.25 MB (4%)
  VIDEOS      99 MB (96%)
  ─────────────────────────
  TOTAL      103 MB

⚠️ Warnings:
  - 8 video(s) > 10MB (run optimize-videos.ps1)
  - 4 JPG image(s) not converted to WebP
```

### Después de Optimización

```
📦 Bundle Size Summary:
  JS         280 KB (0.7%)
  CSS         50 KB (0.13%)
  IMAGES    1.2 MB (3%)
  VIDEOS      37 MB (97%)
  ─────────────────────────
  TOTAL       38 MB

✅ No warnings! Bundle is well optimized.
```

**Reducción total: -63% (-65 MB)**

---

## 🔧 Requisitos

### FFmpeg (Para videos)

**Windows:**
```powershell
# Opción 1: winget
winget install ffmpeg

# Opción 2: Chocolatey
choco install ffmpeg

# Verificar
ffmpeg -version
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### Sharp (Para imágenes)

```powershell
npm install --save-dev sharp
```

---

## 🐛 Troubleshooting

### FFmpeg no encontrado

**Error:** `ffmpeg no reconocido como comando`

**Solución:**
1. Instalar FFmpeg con uno de los métodos anteriores
2. Reiniciar PowerShell/Terminal
3. Verificar: `ffmpeg -version`

### Sharp falla al instalar

**Error:** `Error building Sharp`

**Solución:**
```powershell
# Limpiar cache
npm cache clean --force

# Reinstalar
npm install --save-dev sharp --force
```

### Videos optimizados con mala calidad

**Problema:** Calidad de video demasiado baja

**Solución:**
```powershell
# Usar CRF más bajo (mejor calidad, más tamaño)
.\scripts\optimize-videos.ps1 -CRF 23

# O mantener resolución original
.\scripts\optimize-videos.ps1 -Resolution "1920:1080"
```

### Imágenes WebP no se ven en navegador

**Problema:** Browser viejo sin soporte WebP

**Solución:** Implementar `<picture>` element con fallback:
```html
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="fallback" />
</picture>
```

---

## 📚 Referencias

- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **Sharp Docs**: https://sharp.pixelplumbing.com/
- **WebP Guide**: https://developers.google.com/speed/webp
- **Guía completa**: [optimize-media.md](./optimize-media.md)

---

## 🎯 Comandos Rápidos

```powershell
# Análisis de bundle
npm run build; node scripts/analyze-bundle.mjs

# Optimización completa
.\scripts\optimize-videos.ps1
node scripts\optimize-images.mjs

# Verificar mejoras
npm run build; npm run preview
```

---

## ✅ Checklist

### Optimización de Videos
- [ ] FFmpeg instalado
- [ ] Script ejecutado sin errores
- [ ] Calidad verificada
- [ ] Videos reemplazados

### Optimización de Imágenes
- [ ] Sharp instalado
- [ ] Conversión a WebP exitosa
- [ ] Rutas actualizadas en código
- [ ] Imágenes cargando correctamente

### Verificación Final
- [ ] Build sin errores
- [ ] Análisis de bundle OK
- [ ] Preview funcionando
- [ ] Lighthouse >94

---

*Última actualización: Noviembre 23, 2025*

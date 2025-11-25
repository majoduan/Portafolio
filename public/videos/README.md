# 🎬 Videos de Proyectos

Videos demostrativos optimizados de los proyectos.

## ✨ Videos Actuales (Optimizados)

| Proyecto | Tamaño Original | Optimizado | Reducción |
|----------|----------------|------------|----------|
| poa-management.mp4 | 30.87 MB | 3.76 MB | -87.8% |
| epn-certificates.mp4 | 20.67 MB | 2.09 MB | -89.9% |
| godot-game-2d.mp4 | 14.84 MB | 1.16 MB | -92.2% |
| storycraft.mp4 | 14.73 MB | 1.31 MB | -91.1% |
| space-invaders.mp4 | 14.64 MB | 1.29 MB | -91.2% |
| travel-allowance.mp4 | 13.37 MB | 1.53 MB | -88.6% |
| godot-game-3d.mp4 | 13.20 MB | 0.91 MB | -93.1% |
| fitness-tracker.mp4 | 7.84 MB | 0.91 MB | -88.5% |

**Total**: 12.96 MB (desde 130.17 MB, **-90.0% de reducción**)

## 📋 Especificaciones Técnicas
- **Codec**: H.264 (libx264)
- **Preset**: slow (mejor compresión)
- **CRF**: 25 (calidad óptima para web)
- **Resolución**: 1280x720 (720p)
- **Audio**: AAC 128kbps
- **Container**: MP4 con +faststart (streaming)

## 🎯 Sistema de Precarga
Los videos se cargan usando una estrategia de 5 niveles:
1. **Crítico**: Primeros 2 videos durante boot screen
2. **Alta**: Prefetch después de 3 segundos
3. **Media**: Resto de videos en background
4. **On-Demand**: Precarga al hacer hover
5. **Cache**: Browser cache (instantáneo)

**Resultado**: Videos abren en 0.5-2s (vs 8-10s antes)

## 🔧 Agregar Nuevo Video

```bash
# 1. Obtener video original
# 2. Optimizar con FFmpeg:
ffmpeg -i "input.mp4" -c:v libx264 -preset slow -crf 25 -vf "scale=1280:720" -movflags +faststart -pix_fmt yuv420p -c:a aac -b:a 128k "output.mp4"

# 3. Colocar en public/videos/
# 4. Actualizar src/data/projects.js
```

## 🔗 Documentación
Guía completa de optimización:
- [docs/OPTIMIZATION_GUIDE.md](../../docs/OPTIMIZATION_GUIDE.md#-optimización-de-videos)
- [scripts/README.md](../../scripts/README.md)

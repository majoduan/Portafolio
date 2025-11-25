# 🏆 Certificados

Directorio para imágenes de certificados y reconocimientos.

## 📁 Estructura
```
certificates/
├── webp/               # Imágenes optimizadas (usar estas)
│   ├── epn-award.webp
│   ├── cisco-networking.webp
│   ├── digital-transformation.webp
│   └── scrum-foundation.webp
└── original/           # Originales JPG (backup)
```

## ✨ Imágenes Actuales
1. **epn-award.webp** - EPN Academic Excellence Award (147 KB)
2. **cisco-networking.webp** - Cisco Networking Basics (223 KB)
3. **digital-transformation.webp** - Instituto Europeo de Posgrado (125 KB)
4. **scrum-foundation.webp** - Certiprof SCRUM Foundation (200 KB)

**Total**: 695 KB (optimizado desde 4.16 MB, -83.3% de reducción)

## 📋 Especificaciones
- **Formato**: WebP (mejor compresión y calidad)
- **Quality**: 85
- **Resolución**: Variable según certificado original
- **Orientación**: Landscape preferido

## 🔧 Optimización
Para agregar nuevos certificados:
1. Colocar JPG/PNG original en este directorio
2. Ejecutar: `node scripts/optimize-images.mjs`
3. Actualizar rutas en `src/data/projectTranslations.js`

## 🔗 Documentación
Consulta la guía completa de optimización:
- [docs/OPTIMIZATION_GUIDE.md](../../../docs/OPTIMIZATION_GUIDE.md#-optimización-de-imágenes)
- [scripts/README.md](../../../scripts/README.md)

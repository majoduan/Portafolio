# 🚀 Portfolio - Guía Completa de Desarrollo y Optimización

**Versión 2.4.0** - Guía Unificada  
**Última actualización:** Noviembre 25, 2025

---

## 📋 Contenido

1. [Quick Start](#-quick-start)
2. [Optimizaciones Implementadas](#-optimizaciones-implementadas)
3. [Sistema de Precarga Inteligente](#-sistema-de-precarga-inteligente)
4. [Optimización de Multimedia](#-optimización-de-multimedia)
5. [Internacionalización (i18n)](#-internacionalización-i18n)
6. [Performance y Métricas](#-performance-y-métricas)
7. [Testing y Validación](#-testing-y-validación)
8. [Desarrollo Local](#-desarrollo-local)

---

## ⚡ Quick Start

### Instalación y Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/majoduan/mateo-portfolio.git
cd mateo-portfolio

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Testing Rápido (5 minutos)

```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Navegar a http://localhost:4173
```

**Verificar:**
- ✅ Boot screen carga fluido (5s)
- ✅ Videos precargan durante boot (Network tab)
- ✅ Hover sobre proyecto precarga video
- ✅ Modal abre rápido (0.5-2s)
- ✅ Con cache: instantáneo (50-200ms)

---

## 🎯 Optimizaciones Implementadas

### Fase 1: Core Optimizations ✅ COMPLETADO (v2.0-2.1)

| Optimización | Estado | Impacto | Versión |
|--------------|--------|---------|---------|
| Reducción de partículas | ✅ | +19% FPS | v2.0 |
| React memoization | ✅ | -60% re-renders | v2.0 |
| Code splitting manual | ✅ | -28% bundle | v2.0 |
| Canvas optimizations | ✅ | -30% memoria | v2.0 |
| CSS performance | ✅ | Hardware accel | v2.0 |
| Build optimization | ✅ | Terser 2-pass | v2.1 |

### Fase 2: Multimedia Optimization ✅ COMPLETADO (v2.2)

| Optimización | Estado | Impacto | Versión |
|--------------|--------|---------|---------|
| Videos FFmpeg | ✅ | -90% (130MB→13MB) | v2.2 |
| Imágenes WebP | ✅ | -84% (4.2MB→0.7MB) | v2.2 |
| Sistema precarga 5 niveles | ✅ | Modal 0.5-2s | v2.2 |
| Precarga on-hover | ✅ | Anticipativa | v2.2 |
| Cache tracking | ✅ | Sin re-descargas | v2.2 |

### Fase 3: Advanced Optimizations ✅ COMPLETADO (v2.3-2.4)

| Optimización | Estado | Impacto | Versión |
|--------------|--------|---------|---------|
| CSS Boot Screen separado | ✅ | -15 KB inicial | v2.3 |
| Preconnect Spline | ✅ | -200ms LCP | v2.3 |
| ContactForm lazy | ✅ | -20 KB inicial | v2.3 |
| Service Worker | ✅ | Cache persistente | v2.4 |
| Video Posters | ✅ | Mejor UX | v2.4 |
| Responsive Images | ✅ | -40% móvil | v2.4 |
| CSS Variables | ✅ | Mantenibilidad | v2.4 |
| Partículas adaptativas | ✅ | -8 MB móvil | v2.3 |

---

## 🧠 Sistema de Precarga Inteligente

### 5 Niveles de Prioridad Implementados

```javascript
// Arquitectura del sistema de precarga
NIVEL 1 (Crítico): Spline 3D + Imágenes certificados
   ↓ Durante boot screen (0-5s)
   
NIVEL 2 (Alta): Videos prioritarios (primeros 2)
   ↓ Paralelo con boot screen
   
NIVEL 3 (Media): Videos restantes
   ↓ Prefetch después de 3 segundos
   
NIVEL 4 (On-Demand): Precarga on-hover
   ↓ Cuando usuario hace hover sobre proyecto
   
NIVEL 5 (Cache): Service Worker + Browser cache
   ↓ Segunda visita instantánea
```

### Implementación en HUDBootScreen.jsx

```jsx
const preloadResources = useCallback(() => {
  // NIVEL 1: Spline (crítico)
  const splineLink = document.createElement('link');
  splineLink.rel = 'preload';
  splineLink.as = 'fetch';
  splineLink.href = 'https://prod.spline.design/...';
  document.head.appendChild(splineLink);

  // NIVEL 1: Imágenes de certificados
  certificateImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // NIVEL 2: Videos prioritarios
  const priorityVideos = [
    '/videos/poa-management.mp4',
    '/videos/epn-certificates.mp4'
  ];
  
  priorityVideos.forEach(videoSrc => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = videoSrc;
    video.muted = true;
  });

  // NIVEL 3: Prefetch de videos restantes
  setTimeout(() => {
    remainingVideos.forEach(videoSrc => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = videoSrc;
      document.head.appendChild(link);
    });
  }, 3000);
}, []);
```

### Precarga On-Hover en App.jsx

```jsx
const preloadVideoOnHover = useCallback((videoSrc) => {
  if (videoPreloadCache.current.has(videoSrc)) return;
  
  const video = document.createElement('video');
  video.preload = 'auto';
  video.src = videoSrc;
  video.muted = true;
  
  videoPreloadCache.current.add(videoSrc);
}, []);

// Uso en ProjectCard
<div onMouseEnter={() => preloadVideoOnHover(project.video)}>
```

### Resultados del Sistema

- **Primera carga**: Videos 1-2 listos en 5s (durante boot)
- **Con hover**: Video listo en 0.5-2s
- **Con cache**: Video instantáneo (50-200ms)

---

## 🎬 Optimización de Multimedia

### Videos Optimizados con FFmpeg

**Configuración aplicada:**

```bash
ffmpeg -i "input.mp4" \
  -c:v libx264 \          # Codec H.264
  -preset slow \          # Mejor compresión
  -crf 25 \              # Calidad óptima para web
  -vf "scale=1280:720" \ # 720p
  -movflags +faststart \ # Streaming progresivo
  -pix_fmt yuv420p \     # Compatibilidad
  -c:a aac \             # Audio AAC
  -b:a 128k \            # Bitrate audio
  "output.mp4"
```

**Resultados:**

| Video | Original | Optimizado | Reducción |
|-------|----------|------------|-----------|
| poa-management.mp4 | 30.87 MB | 3.76 MB | -87.8% |
| epn-certificates.mp4 | 20.67 MB | 2.09 MB | -89.9% |
| godot-game-2d.mp4 | 14.84 MB | 1.16 MB | -92.2% |
| storycraft.mp4 | 14.73 MB | 1.31 MB | -91.1% |
| space-invaders.mp4 | 14.64 MB | 1.29 MB | -91.2% |
| travel-allowance.mp4 | 13.37 MB | 1.53 MB | -88.6% |
| godot-game-3d.mp4 | 13.20 MB | 0.91 MB | -93.1% |
| fitness-tracker.mp4 | 7.84 MB | 0.91 MB | -88.5% |
| **Total** | **130.17 MB** | **12.96 MB** | **-90.0%** |

### Imágenes Optimizadas con WebP

**Configuración Sharp:**

```javascript
await sharp(inputPath)
  .resize(600, 600)
  .webp({
    quality: 85,
    effort: 6
  })
  .toFile(outputPath);
```

**Resultados:**

| Certificado | JPG | WebP | Reducción |
|-------------|-----|------|-----------|
| cisco-networking | 1.22MB | 223KB | -81.7% |
| digital-transformation | 726KB | 125KB | -82.8% |
| epn-award | 862KB | 147KB | -83.0% |
| scrum-foundation | 1.38MB | 200KB | -85.5% |
| **Total** | **4.16MB** | **0.68MB** | **-83.7%** |

### Script de Optimización

```bash
# Instalar dependencias
npm install --save-dev sharp

# Ejecutar script
node scripts/optimize-images.mjs
```

---

## 🌐 Internacionalización (i18n)

### Sistema Implementado

- ✅ React Context API para manejo de idioma
- ✅ Detección automática del navegador
- ✅ Persistencia en localStorage
- ✅ Toggle en navegación (desktop + mobile)
- ✅ Traducciones completas (EN/ES)
- ✅ Sin dependencias externas (+0 KB)

### Estructura de Archivos

```
src/
├── contexts/AppContext.jsx         # Context global
├── hooks/useTranslation.js         # Hook personalizado
├── locales/
│   ├── en.json                     # Traducciones inglés
│   └── es.json                     # Traducciones español
└── components/LanguageToggle.jsx   # Componente toggle
```

### Uso en Componentes

```jsx
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t, language } = useTranslation();
  
  return (
    <div>
      <h1>{t('section.title')}</h1>
      <p>{t('section.description')}</p>
    </div>
  );
};
```

### Agregar Traducciones

1. Editar `src/locales/en.json`:
```json
{
  "newSection": {
    "title": "My New Section",
    "content": "This is new content"
  }
}
```

2. Editar `src/locales/es.json`:
```json
{
  "newSection": {
    "title": "Mi Nueva Sección",
    "content": "Este es contenido nuevo"
  }
}
```

3. Usar en componente:
```jsx
<h2>{t('newSection.title')}</h2>
```

**Documentación completa:** [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)

---

## ⚡ Performance y Métricas

### Métricas Actuales (v2.4.0)

| Métrica | Valor | Estado | Meta |
|---------|-------|--------|------|
| **FPS** | 57 FPS | ✅ Excelente | 55-60 |
| **Memoria** | 88 MB | ✅ Óptimo | <100 MB |
| **Bundle JS** | 280 KB | ✅ Reducido | <300 KB |
| **Bundle CSS** | 64 KB | ✅ Óptimo | <100 KB |
| **LCP** | 2.0s | ✅ Bueno | <2.5s |
| **FCP** | 1.4s | ✅ Excelente | <1.8s |
| **Lighthouse** | 96 | ✅ Excelente | >90 |
| **Total multimedia** | 13.6 MB | ✅ Optimizado | <20 MB |

### Evolución de Performance

| Versión | Bundle | FPS | Memoria | LCP | Lighthouse |
|---------|--------|-----|---------|-----|------------|
| v2.0 | 485 KB | 48 | 125 MB | 3.8s | 78 |
| v2.1 | 349 KB | 55 | 95 MB | 2.8s | 92 |
| v2.2 | 280 KB | 57 | 88 MB | 2.4s | 96 |
| v2.3 | 260 KB | 57 | 88 MB | 2.0s | 96 |
| v2.4 | 280 KB | 57 | 88 MB | 2.0s | 96 |

### Optimizaciones React

```jsx
// Memoización de componentes
const HUDBootScreen = memo(() => { ... });
const TechCard = memo(({ tech }) => { ... });

// useMemo para cálculos costosos
const techCategories = useMemo(() => 
  getTechnologies(t), [t]
);

// useCallback para handlers
const handleClick = useCallback(() => {
  // Handler logic
}, []);
```

### CSS Performance

```css
/* Hardware acceleration */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Content visibility */
section {
  content-visibility: auto;
  contain: layout style paint;
}

/* Lazy loading nativo */
img {
  loading: lazy;
}
```

---

## ✅ Testing y Validación

### Chrome DevTools

**Performance Tab:**
1. F12 → Performance
2. Record por 10 segundos
3. Verificar:
   - FPS: 55-60 constante
   - Memory: ~88MB estable
   - No memory leaks
   - Scripting: <10ms por frame

**Network Tab:**
1. F12 → Network
2. Verificar:
   - Videos con Status 200 (primera vez)
   - Videos con Status 304 (cache)
   - Prefetch links activos
   - Hover activa precarga

**Lighthouse Audit:**
1. F12 → Lighthouse
2. Seleccionar "Performance"
3. Run audit
4. Verificar:
   - Performance: >90
   - FCP: <1.5s
   - LCP: <2.5s
   - Score: >92

### Testing de Modal

**Timeline esperado:**
```
T0: Click en proyecto
    ↓
T0 + 10ms: Modal se abre
    ↓
T0 + 50-200ms: Video empieza (desde cache)
    ↓
Usuario feliz 😊
```

### Comandos de Verificación

```bash
# Build y análisis
npm run build
npm run build:analyze

# Preview local
npm run preview

# Testing en diferentes dispositivos
# Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
```

---

## 🔧 Desarrollo Local

### Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Vite dev server (http://localhost:5173)

# Build
npm run build           # Build de producción
npm run build:analyze   # Build + análisis de bundle

# Preview
npm run preview         # Preview del build (http://localhost:4173)

# Linting
npm run lint           # ESLint
```

### Estructura del Proyecto

```
mateo-portfolio/
├── src/
│   ├── components/         # Componentes React
│   │   ├── HUDBootScreen.jsx
│   │   ├── ContactForm.jsx
│   │   ├── TechCard.jsx
│   │   └── icons/tech/
│   ├── contexts/          # Context API
│   │   └── AppContext.jsx
│   ├── data/              # Datos estáticos
│   │   ├── projects.js
│   │   └── technologies.js
│   ├── hooks/             # Custom hooks
│   │   └── useTranslation.js
│   ├── locales/           # Traducciones
│   │   ├── en.json
│   │   └── es.json
│   ├── utils/             # Utilidades
│   │   └── registerSW.js
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Entry point
│   └── index.css          # Estilos globales
│
├── public/
│   ├── sw.js              # Service Worker
│   ├── videos/            # Videos optimizados
│   ├── images/            # Imágenes y certificados
│   └── cv/                # CV en PDF
│
├── scripts/               # Scripts de optimización
│   ├── optimize-images.mjs
│   └── analyze-bundle.mjs
│
└── docs/                  # Documentación
    ├── GUIDE.md           # Esta guía
    ├── I18N_IMPLEMENTATION.md
    └── TECHNICAL_DECISIONS.md
```

### Agregar Nuevo Proyecto

1. **Agregar video optimizado:**
```bash
# Optimizar con FFmpeg
ffmpeg -i "input.mp4" -c:v libx264 -preset slow -crf 25 \
  -vf "scale=1280:720" -movflags +faststart \
  -c:a aac -b:a 128k "output.mp4"

# Mover a public/videos/
```

2. **Agregar a projects.js:**
```javascript
{
  id: 'nuevo-proyecto',
  video: '/videos/nuevo-proyecto.mp4',
  poster: '/videos/posters/nuevo-proyecto.jpg',
  github: 'https://github.com/...',
  // ... resto de datos
}
```

3. **Agregar traducciones:**
```json
// locales/en.json y es.json
"projects": {
  "items": {
    "nuevo-proyecto": {
      "title": "...",
      "description": "...",
      "longDescription": "..."
    }
  }
}
```

---

## 🐛 Troubleshooting

### Videos no precargan

**Síntomas:** Modal tarda 8-10s

**Soluciones:**
1. Verificar nombres de archivos en `public/videos/`
2. Verificar consola: `[Preload] Video precargado: ...`
3. Verificar código en `HUDBootScreen.jsx` líneas 45-68

### Imágenes no son WebP

**Síntomas:** Network tab muestra .jpg

**Soluciones:**
1. Verificar archivos en `public/images/certificates/webp/`
2. Verificar rutas en `src/data/projects.js`
3. Hard refresh: `Ctrl + Shift + R`

### Build falla

**Síntomas:** Error al ejecutar `npm run build`

**Soluciones:**
```bash
# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar
npm install

# Rebuild
npm run build
```

### Service Worker no funciona

**Síntomas:** Cache no persiste

**Soluciones:**
1. Verificar que `public/sw.js` existe
2. Verificar registro en `main.jsx`
3. DevTools → Application → Service Workers
4. Click "Unregister" y recargar

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md) - Sistema de internacionalización
- [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) - Decisiones arquitectónicas
- [scripts/README.md](../scripts/README.md) - Scripts de automatización

### Referencias Externas

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Spline 3D](https://spline.design)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)

---

## 🎓 Para Entrevistas

### Elevator Pitch

> "Desarrollé un portafolio profesional optimizado que alcanza Lighthouse 96/100 mediante técnicas avanzadas de performance: sistema de precarga inteligente de 5 niveles, optimización de multimedia con FFmpeg y Sharp (-90% videos, -84% imágenes), implementación de Service Worker para cache persistente, y lazy loading estratégico de componentes. El resultado es una experiencia de usuario fluida con videos que cargan en 0.5-2 segundos vs 8-10 segundos originalmente."

### Skills Demostradas

- ✅ Web Performance Engineering
- ✅ React Optimization Patterns
- ✅ Modern Browser APIs
- ✅ Build Tools Configuration
- ✅ Multimedia Optimization
- ✅ Progressive Web App
- ✅ Internationalization
- ✅ Technical Documentation

### Métricas Cuantificables

- **-90% multimedia** (134MB → 13.6MB)
- **-85% tiempo de carga modal** (10s → 1.5s)
- **-98% con cache** (10s → 50ms)
- **+19% FPS** (48 → 57)
- **-30% memoria** (125MB → 88MB)
- **Lighthouse 96/100** (top 5% de sitios web)

---

**Última actualización:** Noviembre 25, 2025  
**Versión del proyecto:** 2.4.0  
**Autor:** Mateo Dueñas

---

**🎉 Portfolio Completamente Optimizado y Documentado**

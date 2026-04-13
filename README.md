# 🚀 Portfolio - Mateo Dueñas

Portfolio profesional interactivo construido con React, Vite, Tailwind CSS y Spline 3D.

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz hermosa con gradientes, glassmorphism y animaciones fluidas
- 🎭 **HUD Boot Screen**: Pantalla de inicio futurista estilo sci-fi
- 🌌 **Animación 3D**: Integración de Spline para experiencia inmersiva
- ⚡ **Sistema de Partículas**: Canvas interactivo con partículas que reaccionan al mouse
- 📱 **Responsive**: Optimizado para todos los dispositivos
- 🚀 **Performance Optimizado**: 60 FPS, bundle size reducido, lazy loading inteligente
- 🔒 **Seguridad Reforzada**: CSP headers, HSTS, XSS protection, headers de seguridad HTTP

## 🎯 Performance Optimizations v2.4 (Diciembre 2025)

### 🔥 **NUEVO v2.4: Control Agresivo de Videos (YouTube-inspired)**
- 🎬 **Threshold 50%**: Videos se reproducen solo cuando 50% está visible (antes: 80%)
- ⏱️ **Límite 10s móvil**: Videos se pausan automáticamente a los 10s en móvil
- 🖥️ **Desktop optimizado**: IntersectionObserver en desktop (antes: autoplay sin control)
- 🧹 **Cache limpiado**: Al abrir modal, cache de videos se limpia (previene trabas móvil)
- ⚡ **GPU móvil**: 85% → 15% (-82%)
- 💾 **RAM móvil**: 280MB → 90MB (-68%)
- 🔋 **Batería**: -8%/min → -1.5%/min (-81% consumo)
- 📊 **FPS móvil**: 15-25 → 55-60 (+233%)

### 🚀 Resultados Finales
- ⚡ **Modal 85% más rápido**: 8-10s → 0.5-2s
- 🚀 **Con cache 98% mejora**: 8-10s → 50-200ms
- 💾 **Multimedia -89.8%**: 134MB → 14MB
- 📊 **Lighthouse Score**: 92 → 96 (+4%)
- ⚡ **FPS Desktop**: 48 → 57 (+19%)
- 💾 **Memoria Desktop**: 125MB → 88MB (-30%)
- 📦 **Bundle**: 420KB → 280KB (-33%)

### ✨ Sistema de Precarga Adaptativa
1. **Detección automática**: Dispositivo móvil y velocidad de conexión
2. **Desktop + WiFi rápida**: Precarga todos los videos (comportamiento original)
3. **Móvil o conexión lenta**: Solo posters, videos on-demand
4. **Intersection Observer**: Solo reproduce video visible en viewport (móvil)
5. **Cache inteligente**: Browser cache para visitas subsecuentes

### 🎬 Optimizaciones de Multimedia
- Videos: 130MB → 13MB con FFmpeg (H.264, CRF 25, 720p)
- Imágenes: 4.2MB → 0.7MB con Sharp (WebP, quality 85)
- Móvil: Videos pausan automáticamente fuera del viewport
- Desktop: Sin cambios (todos los videos autoplay)

**📚 Documentación completa**: 
- [docs/GUIDE.md](./docs/GUIDE.md) - Guía completa con todas las optimizaciones y testing móvil
- [docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md) - Decisiones técnicas y análisis arquitectónico
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Historial de cambios del proyecto

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, Tailwind CSS 3
- **Build Tool**: Vite 7
- **3D Graphics**: Spline
- **Icons**: Lucide React
- **Animations**: CSS custom animations, Canvas API

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/majoduan/mateo-portfolio.git

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## 📚 Documentación Completa

La documentación del proyecto está organizada en el directorio `/docs`:

- **[docs/README.md](./docs/README.md)** - Índice principal de documentación
- **[docs/GUIDE.md](./docs/GUIDE.md)** - Guía completa de desarrollo, optimizaciones y testing móvil
- **[docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md)** - Decisiones arquitectónicas y análisis técnico
- **[docs/I18N_IMPLEMENTATION.md](./docs/I18N_IMPLEMENTATION.md)** - Sistema de internacionalización
- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Historial de cambios y versiones
- **[scripts/README.md](./scripts/README.md)** - Documentación de scripts de optimización

## 🧪 Testing y Validación

### Quick Performance Test
```bash
# Build y analizar
npm run build:analyze

# Preview local
npm run preview
```

### Validar con Chrome DevTools
1. F12 → **Performance** tab
2. Record por 10 segundos
3. Verifica: FPS ~57, Memory ~88MB

### Lighthouse Audit
1. F12 → **Lighthouse** tab
2. Run audit
3. Target: Score >90

**Guía detallada**: [docs/GUIDE.md](./docs/GUIDE.md#-testing-y-validación)

## 📊 Estructura del Proyecto

```
mateo-portfolio/
├── docs/                        # 📚 Documentación técnica
│   ├── README.md                # Índice de documentación
│   ├── GUIDE.md                 # Guía completa (desarrollo + optimizaciones + testing)
│   ├── TECHNICAL_DECISIONS.md   # Decisiones arquitectónicas
│   ├── I18N_IMPLEMENTATION.md   # Sistema i18n
│   └── CHANGELOG.md             # Historial de cambios
├── scripts/                     # 🛠️ Scripts de optimización
│   └── README.md                # Documentación de scripts
├── src/
│   ├── components/
│   │   ├── HUDBootScreen.jsx    # Pantalla de inicio
│   │   ├── TechCard.jsx         # Cards de tecnologías
│   │   ├── ContactForm.jsx      # Formulario de contacto
│   │   └── icons/tech/          # Iconos SVG personalizados
│   ├── contexts/
│   │   └── AppContext.jsx       # Context API (theme + i18n)
│   ├── data/
│   │   ├── projects.js          # Datos de proyectos
│   │   └── technologies.js      # Datos de skills
│   ├── locales/
│   │   ├── en.json              # Traducciones inglés
│   │   └── es.json              # Traducciones español
│   ├── utils/
│   │   ├── preloadResources.js  # Sistema de precarga
│   │   └── registerSW.js        # Service Worker
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
├── public/
│   ├── videos/                  # Videos de proyectos (optimizados)
│   ├── images/                  # Imágenes y certificados
│   ├── cv/                      # CV en PDF
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service Worker
└── vite.config.js               # Configuración optimizada
```

## 🎨 Secciones

1. **Home**: Hero section con animación 3D de Spline
2. **Technologies**: Skills organizadas por categoría con transiciones suaves
3. **Certificates**: Carrusel infinito de certificaciones
4. **Projects**: Galería de proyectos con videos demostrativos
5. **Contact**: Links a redes sociales y email

## 🔧 Configuración de Vite

Optimizaciones incluidas:
- Code splitting manual para vendors
- Terser con 2 passes de compresión
- CSS code splitting habilitado
- Asset inlining hasta 4KB
- Sourcemaps deshabilitados en producción

## 📈 Performance Metrics (Production)

### Desktop
| Métrica | Valor | Status |
|---------|-------|--------|
| **FPS** | 57 FPS | ✅ Excelente |
| **Memory** | 88 MB | ✅ Óptimo |
| **Bundle** | 280 KB | ✅ Reducido |
| **LCP** | 2.4s | ✅ Bueno |
| **FCP** | 1.4s | ✅ Excelente |
| **Lighthouse** | 92 | ✅ Excelente |

### Mobile (Samsung Galaxy S23 FE)
| Métrica | Antes v2.2 | Después v2.3 | Mejora |
|---------|------------|--------------|--------|
| **FPS** | 15-25 | 55-60 | +200% |
| **GPU Usage** | 85-95% | 15-25% | -80% |
| **RAM** | 280 MB | 95 MB | -66% |
| **Battery/min** | -8% | -2% | -75% |
| **Videos activos** | 8 | 1 | -87.5% |
| **Temperatura** | 🔥🔥🔥 Crítica | 🔥 Normal | ✅ Resuelto |

Ver análisis detallado: [docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md)

### Auditoría integral v3.1.0 (Abril 2026)

Ronda de optimización en 8 fases sobre el baseline v3.0.0. Cada fase es un commit aislado; resultados medibles por fase:

| Fase | Área | Resultado |
|------|------|-----------|
| 1 | ParticleCanvas | Debounce resize 150ms, rebalance al cruzar 768px, `prefers-reduced-motion` estático, IntersectionObserver pausa RAF si ocluido |
| 2 | Imágenes | `next/image` (unoptimized) con dims explícitas en marquee / timeline / about / projects; prefetch foto-perfil condicional por viewport |
| 3 | CSS | `contain-intrinsic-size` por sección (#home 900px, #certificates 700px, #projects 900px, #contact 900px, marquee 220px) |
| 4 | Assets | `pygame.svg` (72 KB, PNG raster embebido) → `pygame.avif` 128×128 (4.4 KB, **−94%**) |
| 5 | A11y | `role="status"` + `aria-live` en TypingQuotes; `inert`/`aria-hidden` sobre fondo al abrir modal; `aria-invalid` + `aria-describedby` en ContactForm; HUDBootScreen fast-path <1s con reduced-motion |
| 6 | Service Worker | v2.6.0: `networkFirst` con timeout 3s (Promise.race), precache amplía `/bow-and-arrow.svg` + `/manifest.json` |
| 7 | Videos | 8 mp4 desktop re-encoded h264 CRF 28 + `+faststart`: 13.58 MB → 10.94 MB (**−19.5%**) |
| 8 | Cleanup | `cacheFirstWithExpiry` dead code removido; `WorkTimeline` RAF cancelable; `AppContext` callbacks estabilizados con `useCallback` |

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad:

- ✅ **Content Security Policy (CSP)** - Headers HTTP restrictivos
- ✅ **HSTS** - Strict-Transport-Security con preload
- ✅ **XSS Protection** - Múltiples medidas anti-XSS
- ✅ **Clickjacking Prevention** - X-Frame-Options: DENY
- ✅ **MIME Sniffing Protection** - X-Content-Type-Options
- ✅ **Permissions Policy** - APIs sensibles deshabilitadas
- ✅ **Sin dependencias vulnerables** - Auditorías regulares con npm audit

**Documentación completa**: [docs/SECURITY.md](./docs/SECURITY.md)

## 🛠️ Solución de Problemas

¿Ves mensajes de error en la consola? ¿WebSocket warnings? ¿Logs duplicados?

**Revisa la guía completa**: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

### Problemas Comunes (Quick Fix)

- **WebSocket errors**: Normal en desarrollo, no afecta funcionalidad
- **Logs duplicados**: React Strict Mode (solo en dev)
- **Service Worker disabled**: Solo activo en producción
- **Puerto ocupado**: `lsof -ti:5173 | xargs kill -9`

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Mateo Dueñas**
- LinkedIn: [mateo-dueñas-andrade](https://linkedin.com/in/mateo-dueñas-andrade)
- GitHub: [majoduan](https://github.com/majoduan)
- Email: mate.due02@gmail.com

---

**Hecho con ❤️ y optimizado para performance 🚀**

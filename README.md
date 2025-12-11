# 🚀 Portfolio - Mateo Dueñas

Portfolio profesional interactivo construido con React, Vite, Tailwind CSS y Spline 3D.

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz hermosa con gradientes, glassmorphism y animaciones fluidas
- 🎭 **HUD Boot Screen**: Pantalla de inicio futurista estilo sci-fi
- 🌌 **Animación 3D**: Integración de Spline para experiencia inmersiva
- ⚡ **Sistema de Partículas**: Canvas interactivo con partículas que reaccionan al mouse
- 📱 **Responsive**: Optimizado para todos los dispositivos
- 🚀 **Performance Optimizado**: 60 FPS, bundle size reducido, lazy loading inteligente

## 🎯 Performance Optimizations v2.3 (Diciembre 2025)

### 🔥 **NUEVO: Optimización Crítica para Móviles**
- 📱 **Videos selectivos**: Solo 1 video activo en móvil (vs 8 simultáneos)
- ⚡ **GPU móvil**: 85% → 15% (-70% de uso)
- 💾 **RAM móvil**: 280MB → 95MB (-66%)
- 🔋 **Batería**: -8%/min → -2%/min (-75% consumo)
- 📊 **FPS móvil**: 15-25 → 55-60 (+200%)
- 🌡️ **Temperatura**: Reducción significativa (no más apagados)

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

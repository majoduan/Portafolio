# 🚀 Portfolio - Mateo Dueñas

Portfolio profesional interactivo construido con React, Vite, Tailwind CSS y Spline 3D.

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz hermosa con gradientes, glassmorphism y animaciones fluidas
- 🎭 **HUD Boot Screen**: Pantalla de inicio futurista estilo sci-fi
- 🌌 **Animación 3D**: Integración de Spline para experiencia inmersiva
- ⚡ **Sistema de Partículas**: Canvas interactivo con partículas que reaccionan al mouse
- 📱 **Responsive**: Optimizado para todos los dispositivos
- 🚀 **Performance Optimizado**: 60 FPS, bundle size reducido, lazy loading inteligente

## 🎯 Performance Optimizations v2.2 (Noviembre 2025)

### Métricas Reales Alcanzadas
- ⚡ **+18.75% FPS**: 48 → 57 FPS promedio
- 💾 **-29.6% Memoria**: 125MB → 88MB de uso
- 📦 **-33% Bundle Size**: 420KB → 280KB
- 🎨 **-50% FCP**: 2.8s → 1.4s (First Contentful Paint)
- 🚀 **-40% TTI**: 4.2s → 2.5s (Time to Interactive)
- 📊 **+17.9% Lighthouse**: 78 → 92 score

### 🆕 Optimizaciones de Multimedia v2.2
- 🎬 **Sistema de Precarga Inteligente**: Videos prioritarios durante boot screen
- ⚡ **Precarga On-Hover**: Videos se cargan antes de abrir modal
- 🎯 **Cache Multinivel**: Evita re-descargas (10s → 50ms con cache)
- 📉 **-85% Tiempo Modal**: 8-10s → 0.5-2s para abrir videos
- 💾 **-89.8% Multimedia**: 134MB → 14MB (videos + imágenes optimizados)

### Técnicas Aplicadas
- ✅ **Precarga Inteligente** con 5 niveles de prioridad
- ✅ **Lazy Loading** con Intersection Observer
- ✅ **Precarga On-Hover** para videos
- ✅ **Code Splitting** estratégico
- ✅ **Memoización** (React.memo, useMemo, useCallback)
- ✅ **CSS Performance** (will-change, content-visibility)
- ✅ **Bundle Optimization** (Terser, tree shaking)
- ✅ **Video Optimization** (FFmpeg: H.264, CRF 25, 720p, faststart)
- ✅ **Image Optimization** (WebP con Sharp: quality 85)

**📚 Documentación completa**: [docs/OPTIMIZATION_GUIDE.md](./docs/OPTIMIZATION_GUIDE.md)

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

**Detalles completos**: [PERFORMANCE.md](./PERFORMANCE.md)

## 📊 Estructura del Proyecto

```
mateo-portfolio/
├── src/
│   ├── components/
│   │   ├── HUDBootScreen.jsx    # Pantalla de inicio
│   │   ├── TechCard.jsx         # Cards de tecnologías
│   │   ├── AnimatedCounter.jsx  # Contador animado
│   │   └── icons/tech/          # Iconos SVG personalizados
│   ├── data/
│   │   ├── projects.js          # Datos de proyectos
│   │   └── technologies.js      # Datos de skills
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
├── public/
│   ├── videos/                  # Videos de proyectos
│   ├── images/                  # Imágenes y certificados
│   └── cv/                      # CV en PDF
├── OPTIMIZACIONES.md            # Reporte detallado
├── TESTING_GUIDE.md             # Guía de validación
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

| Métrica | Valor | Status |
|---------|-------|--------|
| **FPS** | 57 FPS | ✅ Excelente |
| **Memory** | 88 MB | ✅ Óptimo |
| **Bundle** | 280 KB | ✅ Reducido |
| **LCP** | 2.4s | ✅ Bueno |
| **FCP** | 1.4s | ✅ Excelente |
| **Lighthouse** | 92 | ✅ Excelente |

Ver análisis detallado: [PERFORMANCE.md](./PERFORMANCE.md)

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

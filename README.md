# 🚀 Portfolio - Mateo Dueñas

Portfolio profesional interactivo construido con React, Vite, Tailwind CSS y Spline 3D.

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz hermosa con gradientes, glassmorphism y animaciones fluidas
- 🎭 **HUD Boot Screen**: Pantalla de inicio futurista estilo sci-fi
- 🌌 **Animación 3D**: Integración de Spline para experiencia inmersiva
- ⚡ **Sistema de Partículas**: Canvas interactivo con partículas que reaccionan al mouse
- 📱 **Responsive**: Optimizado para todos los dispositivos
- 🚀 **Performance Optimizado**: 60 FPS, bundle size reducido, lazy loading inteligente

## 🎯 Optimizaciones v2.0 (Noviembre 2025)

### Mejoras de Performance
- ⚡ **+18.75% FPS**: De 48 a 57 FPS promedio
- 💾 **-29.6% Memoria**: De 125MB a 88MB de uso
- 📦 **-28% Bundle Size**: De 485KB a 349KB gzipped
- 🎨 **-36.8% LCP**: De 3.8s a 2.4s (Largest Contentful Paint)
- 🚀 **-23.6% Boot Time**: De 5.5s a 4.2s

### Optimizaciones Técnicas
- Reducción de partículas (50% en HUD, 33% en main canvas)
- Memoización con `useMemo` y `useCallback`
- Code splitting optimizado
- CSS containment y content-visibility
- Lazy loading inteligente de recursos
- Eliminación de memory leaks

**Ver detalles completos**: [OPTIMIZACIONES.md](./OPTIMIZACIONES.md)

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

Para validar las optimizaciones y medir performance:

```bash
# Ver guía completa de testing
cat TESTING_GUIDE.md
```

### Quick Test
1. Abre Chrome DevTools
2. Ve a Performance tab
3. Record por 10 segundos
4. Verifica: FPS ~57, Memory estable ~88MB

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

## 📈 Performance Metrics

| Métrica | Valor | Score |
|---------|-------|-------|
| FPS | 57 FPS | ✅ Excelente |
| Memory | 88 MB | ✅ Óptimo |
| Bundle | 349 KB | ✅ Reducido |
| LCP | 2.4s | ✅ Bueno |
| Lighthouse | ~92 | ✅ Excelente |

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

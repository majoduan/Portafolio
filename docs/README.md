# 📚 Documentación del Proyecto

Bienvenido a la documentación técnica del portafolio de Mateo Dueñas.

## 📖 Índice de Documentación

### 🚀 [Guía Completa](./GUIDE.md) ⭐ **RECOMENDADO**
**¡Empieza aquí!** Guía unificada de desarrollo y optimización:
- Quick Start y setup del proyecto
- Todas las optimizaciones implementadas (v2.4.0+)
- Sistema de precarga inteligente de 5 niveles
- Optimización de multimedia (videos y imágenes)
- **Optimización móvil v2.3** - Control de videos selectivos
- Sistema de internacionalización
- Performance y métricas actuales
- Testing móvil y desktop, validación y troubleshooting
- **Todo en un solo documento consolidado**

### 🏗️ [Decisiones Técnicas](./TECHNICAL_DECISIONS.md) 📋
Análisis arquitectónico y decisiones de diseño:
- Stack tecnológico y justificaciones
- Arquitectura del sistema (Context API, precarga, etc.)
- Trade-offs considerados y por qué se tomaron decisiones específicas
- Comparaciones técnicas (React vs otros, FFmpeg vs cloud, etc.)
- Lecciones aprendidas y evolución futura
- **Para entrevistas técnicas**

### 🌐 [Implementación de i18n](./I18N_IMPLEMENTATION.md)
Sistema de internacionalización completo:
- Arquitectura del sistema de traducciones
- Uso del hook useTranslation
- Agregar nuevos idiomas
- Best practices y decisiones de diseño

### 📋 [Historial de Cambios](./CHANGELOG.md)
Registro completo de versiones y actualizaciones:
- Changelog detallado por versión
- Nuevas funcionalidades agregadas
- Optimizaciones implementadas
- Bugs corregidos

### 🛠️ [Scripts de Automatización](../scripts/README.md)
Scripts de optimización disponibles:
- Optimización de imágenes a WebP
- Compresión de videos con FFmpeg
- Análisis de bundle de producción

## 🏗️ Estructura del Proyecto

```
mateo-portfolio/
├── docs/                           # 📚 Documentación técnica
│   ├── README.md                   # Este archivo (índice)
│   ├── GUIDE.md                    # Guía completa (desarrollo + optimizaciones + testing)
│   ├── TECHNICAL_DECISIONS.md      # Decisiones arquitectónicas
│   ├── I18N_IMPLEMENTATION.md      # Sistema de internacionalización
│   └── CHANGELOG.md                # Historial de cambios
│
├── scripts/                        # 🛠️ Scripts de optimización
│   └── README.md                   # Documentación de scripts
│
├── public/                         # 🎬 Assets públicos
│   ├── videos/                     # Videos de proyectos (optimizados, 13MB total)
│   ├── images/                     # Imágenes y certificados (WebP, 0.7MB)
│   ├── cv/                         # CV en PDF
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service Worker
│
├── src/                            # 💻 Código fuente
│   ├── components/                 # Componentes React
│   ├── contexts/                   # Context API (theme + i18n)
│   ├── data/                       # Datos estáticos
│   ├── hooks/                      # Custom hooks
│   ├── locales/                    # Traducciones (en, es)
│   ├── utils/                      # Utilidades (precarga, SW)
│   ├── App.jsx                     # Componente principal
│   └── main.jsx                    # Entry point
│
└── vite.config.js                  # Configuración de build optimizada
```
│   ├── images/                     # Imágenes y certificados
│   └── cv/                         # CV en PDF
│
├── scripts/                        # 🤖 Scripts de automatización
│   ├── analyze-bundle.mjs          # Análisis de bundle
│   ├── optimize-images.mjs         # Conversión a WebP
│   └── README.md                   # Documentación de scripts
│
├── src/                            # 💻 Código fuente
│   ├── components/                 # Componentes React
│   ├── contexts/                   # Context API (i18n, theme)
│   ├── data/                       # Datos de proyectos y tecnologías
│   ├── hooks/                      # Custom hooks
│   ├── locales/                    # Archivos de traducción
│   ├── App.jsx                     # Componente principal
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Estilos globales
│
├── README.md                       # Documentación general
├── CHANGELOG.md                    # Historial de cambios
├── package.json                    # Dependencias
└── vite.config.js                  # Configuración de Vite
```

## 🎯 Filosofía del Proyecto

Este portafolio está diseñado con un enfoque en:

1. **Performance** - Optimizado para carga rápida y experiencia fluida
2. **Accesibilidad** - Diseño inclusivo y compatible con lectores de pantalla
3. **Internacionalización** - Soporte para múltiples idiomas
4. **Mantenibilidad** - Código limpio y bien documentado
5. **Escalabilidad** - Arquitectura que permite crecimiento fácil

---

## 📑 Documentos Actualizados (v2.4.1)

La documentación ha sido **consolidada y reorganizada** para mayor claridad:

- ✅ **GUIDE.md** - Fusiona Quick Start + Optimization Guide
- ✅ **TECHNICAL_DECISIONS.md** - Fusiona Executive Summary + Performance Analysis
- ❌ Eliminados: QUICK_START.md, EXECUTIVE_SUMMARY.md, PERFORMANCE_ANALYSIS.md, STRUCTURE.md
- **Resultado**: Documentación más clara, actualizada y fácil de navegar

## 🚀 Quick Start

```bash
# Clonar repositorio
git clone https://github.com/majoduan/mateo-portfolio.git

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📊 Métricas Actuales

| Métrica | Valor | Estado |
|---------|-------|--------|
| **FPS** | 57 FPS | ✅ Excelente |
| **Memoria** | 88 MB | ✅ Óptimo |
| **Bundle JS** | 280 KB | ✅ Reducido |
| **LCP** | 2.0s | ✅ Bueno |
| **Lighthouse** | 96 | ✅ Excelente |
| **Videos** | 13 MB | ✅ Optimizado (-90%) |
| **Imágenes** | 0.7 MB | ✅ WebP (-84%) |

## 🎨 Stack Tecnológico

- **Frontend**: React 19, Tailwind CSS 3
- **Build**: Vite 7
- **3D Graphics**: Spline
- **Icons**: Lucide React
- **Optimización**: Sharp, FFmpeg
- **Idiomas**: i18n custom (sin dependencias)

## 📝 Convenciones de Código

- **Componentes**: PascalCase (`ContactForm.jsx`)
- **Hooks**: camelCase con prefijo "use" (`useTranslation.js`)
- **Utilities**: camelCase (`formatBytes`)
- **CSS Classes**: kebab-case o Tailwind utilities
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`)

## 🔗 Enlaces Importantes

- [GitHub Repository](https://github.com/majoduan/mateo-portfolio)
- [LinkedIn](https://linkedin.com/in/mateo-dueñas-andrade)
- [Email](mailto:mate.due02@gmail.com)

## 📖 Recursos Adicionales

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Spline 3D](https://spline.design)

---

**Última actualización**: Noviembre 25, 2025  
**Versión del proyecto**: 2.2.0  
**Autor**: Mateo Dueñas

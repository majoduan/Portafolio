# 🏗️ Decisiones Técnicas y Arquitectónicas

**Proyecto:** Portfolio de Mateo Dueñas  
**Versión:** 2.4.0  
**Fecha:** Noviembre 25, 2025

---

## 📋 Índice

1. [Introducción](#-introducción)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Decisiones de Performance](#-decisiones-de-performance)
5. [Internacionalización](#-internacionalización)
6. [Gestión de Assets](#-gestión-de-assets)
7. [Trade-offs y Justificaciones](#-trade-offs-y-justificaciones)

---

## 🎯 Introducción

Este documento detalla las **decisiones arquitectónicas** tomadas durante el desarrollo del portafolio, explicando el **razonamiento técnico** detrás de cada elección y los **trade-offs** considerados.

### Filosofía de Desarrollo

1. **Performance First** - Priorizar experiencia del usuario
2. **Zero Dependencies** cuando sea posible
3. **Progressive Enhancement** - Funcional en todos los dispositivos
4. **Maintainability** - Código limpio y documentado
5. **Measurable Impact** - Cada optimización medida con métricas

---

## 🛠️ Stack Tecnológico

### Frontend Framework: React 19

**Decisión:** React en lugar de Vue, Svelte, o vanilla JS

**Razones:**
- ✅ **Ecosistema maduro** - Herramientas y recursos abundantes
- ✅ **Performance moderna** - React 19 con mejoras significativas
- ✅ **Experiencia previa** - Familiaridad con el framework
- ✅ **Hiring demand** - Muy demandado en el mercado laboral
- ✅ **Hooks avanzados** - useMemo, useCallback para optimizaciones

**Trade-offs considerados:**
- ❌ Bundle más grande que Preact (~40 KB vs ~3 KB)
- ❌ Menos "cool factor" que frameworks nuevos como Solid.js
- ✅ **Mitigación:** Code splitting y lazy loading compensan el tamaño

### Build Tool: Vite 7

**Decisión:** Vite en lugar de Webpack, Parcel, o esbuild

**Razones:**
- ✅ **Velocidad extrema** - HMR instantáneo, build rápido
- ✅ **Configuración simple** - Menos boilerplate que Webpack
- ✅ **Optimizaciones built-in** - Tree shaking, code splitting
- ✅ **Experiencia de desarrollo** - DX superior
- ✅ **Plugin ecosystem** - Rollup plugins compatibles

**Configuración clave:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'spline': ['@splinetool/react-spline'],
          'icons': ['lucide-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_console: true
      }
    }
  }
}
```

**Trade-offs:**
- ❌ Menos control granular que Webpack
- ✅ **Decisión:** La velocidad y simplicidad valen la pena

### Styling: Tailwind CSS 3

**Decisión:** Tailwind en lugar de CSS-in-JS (styled-components) o CSS Modules

**Razones:**
- ✅ **Performance** - No runtime, CSS puro
- ✅ **Bundle size** - Solo clases usadas (PurgeCSS)
- ✅ **Velocity** - Desarrollo rápido con utility-first
- ✅ **Consistencia** - Design system integrado
- ✅ **Responsive** - Breakpoints simples

**Trade-offs considerados:**
- ❌ HTML más verboso con clases largas
- ❌ Curva de aprendizaje inicial
- ✅ **Decisión:** Productividad > Elegancia en HTML

### 3D Graphics: Spline

**Decisión:** Spline en lugar de Three.js, Babylon.js, o Unity WebGL

**Razones:**
- ✅ **No-code editing** - Editor visual intuitivo
- ✅ **React integration** - `@splinetool/react-spline` oficial
- ✅ **Performance** - Optimizado automáticamente
- ✅ **Export control** - Tamaños de archivo manejables
- ✅ **Lazy loading** - Compatible con dynamic import

**Implementación:**
```jsx
const Spline = lazy(() => import('@splinetool/react-spline'));

<Suspense fallback={<SplineLoader />}>
  <Spline scene="https://prod.spline.design/..." />
</Suspense>
```

**Trade-offs:**
- ❌ Menos control que Three.js custom
- ❌ Dependencia de servicio externo (prod.spline.design)
- ✅ **Mitigación:** Preconnect reduce latencia inicial

---

## 🏗️ Arquitectura del Sistema

### Context API vs Estado Global

**Decisión:** React Context API en lugar de Redux, Zustand, o Jotai

**Razones:**
- ✅ **Zero dependencies** - Built-in en React
- ✅ **Suficiente para el caso de uso** - Solo 2 estados globales:
  - Idioma (language)
  - Tema (theme - futuro)
- ✅ **Performance adecuada** - Con optimizaciones (useMemo)
- ✅ **Simplicidad** - Menos boilerplate

**Implementación:**
```jsx
// AppContext.jsx
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage());
  
  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage
  }), [language]);
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

**Cuándo consideraría Redux:**
- Más de 5 piezas de estado global
- Lógica de estado compleja con múltiples reducers
- Debugging avanzado con Redux DevTools necesario

### Sistema de Precarga: Custom vs Bibliotecas

**Decisión:** Sistema custom de 5 niveles en lugar de librerías como react-query o SWR

**Razones:**
- ✅ **Control total** - Lógica específica para videos y assets
- ✅ **Zero dependencies** - No agregar biblioteca pesada
- ✅ **Performance óptima** - Estrategia adaptada al caso de uso
- ✅ **Aprendizaje** - Demuestra comprensión profunda de APIs del navegador

**Niveles implementados:**
1. **Crítico** - Spline + imágenes durante boot (preload)
2. **Alta** - Videos prioritarios en paralelo (preload)
3. **Media** - Videos restantes con prefetch
4. **On-demand** - Precarga on-hover anticipativa
5. **Cache** - Service Worker + browser cache

**APIs del navegador utilizadas:**
- `<link rel="preload">` - Recursos críticos
- `<link rel="prefetch">` - Recursos futuros
- `<link rel="preconnect">` - Resolución DNS anticipada
- Service Worker Cache API - Persistencia

**Trade-offs:**
- ❌ Más código custom para mantener
- ✅ **Beneficio:** -85% tiempo de carga modal (10s → 1.5s)

---

## ⚡ Decisiones de Performance

### 1. Reducción de Partículas

**Problema inicial:** 110 partículas (80 boot + 30 app) consumían CPU

**Decisión:** Reducir a 60 partículas (40 boot + 20 app)

**Análisis:**
```
Antes:
- FPS: 48 promedio
- CPU: 65%
- Visible lag en móviles

Después:
- FPS: 57 promedio (+19%)
- CPU: 42% (-35%)
- Fluido en móviles
```

**Justificación:**
- ✅ Mejora perceptible en performance
- ✅ Efecto visual mantiene impacto
- ✅ Adaptativo según dispositivo (10 móvil, 20 desktop)

### 2. React Memoization

**Decisión:** Aplicar memo/useMemo/useCallback estratégicamente

**Componentes memorizados:**
```jsx
// Componentes pesados
const HUDBootScreen = memo(() => { ... });
const TechCard = memo(({ tech }) => { ... }, propsAreEqual);
const ContactForm = memo(() => { ... });

// Cálculos costosos
const techCategories = useMemo(() => 
  getTechnologies(t), [t]
);

const projects = useMemo(() => 
  getProjectsData(t), [t]
);

// Handlers estables
const handleClick = useCallback(() => {
  // Logic
}, [dependencies]);
```

**Resultado:** -60% re-renders innecesarios

**Cuándo NO usar memo:**
- Componentes simples (<10 líneas)
- Props que siempre cambian
- Componentes que renderizan 1 vez

### 3. CSS Performance

**Decisión:** Separar CSS del boot screen

**Antes:**
```css
/* index.css - 1200+ líneas */
/* Todo se carga al inicio */
```

**Después:**
```css
/* index.css - 800 líneas */
/* Estilos core y app */

/* HUDBootScreen.css - 400 líneas */
/* Cargado solo en boot screen */
```

**Beneficio:** -15 KB CSS inicial, +0.1s FCP

**Otras optimizaciones CSS:**
```css
/* Hardware acceleration */
.animated {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Content visibility */
section {
  content-visibility: auto;
  contain: layout style paint;
}
```

### 4. Code Splitting Manual

**Decisión:** Chunks manuales en lugar de automáticos

**Configuración Vite:**
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'spline': ['@splinetool/react-spline'],
  'icons': ['lucide-react']
}
```

**Beneficios:**
- ✅ Control sobre tamaños de chunk
- ✅ Cache más efectivo (vendor changes less)
- ✅ Parallel loading de chunks independientes

**Resultado:**
- react-vendor: 189 KB (estable, cache largo)
- spline: 4.33 MB (lazy loaded)
- icons: Integrado en main (pequeño)

---

## 🌐 Internacionalización

### Decisión: Custom vs i18next

**Elección:** Sistema custom basado en Context API

**Comparación:**

| Aspecto | Custom | i18next |
|---------|--------|---------|
| Bundle size | +10 KB | +50-100 KB |
| Setup complexity | Baja | Media-Alta |
| Features | Básicas | Completas |
| Performance | Excelente | Buena |
| Learning curve | Mínima | Media |

**Decisión:** Custom es suficiente para este caso

**Justificación:**
- ✅ Solo 2 idiomas (EN/ES)
- ✅ Traducciones estáticas (no dinámicas)
- ✅ No necesita pluralización compleja
- ✅ No necesita interpolación avanzada
- ✅ Zero dependencies

**Estructura de traducciones:**
```json
{
  "nav": { "home": "Home" },
  "projects": {
    "items": {
      "poa": {
        "title": "...",
        "longDescription": "..."
      }
    }
  }
}
```

**Cuándo usaría i18next:**
- Más de 5 idiomas
- Traducciones con pluralización compleja
- Interpolación dinámica frecuente
- Lazy loading de traducciones

---

## 🎬 Gestión de Assets

### Videos: FFmpeg vs Servicio Cloud

**Decisión:** Optimización local con FFmpeg

**Alternativas consideradas:**
1. **Cloudinary / Imgix** - Servicio de optimización cloud
2. **YouTube embeds** - Hosting gratuito
3. **FFmpeg local** - Control total

**Elección:** FFmpeg local

**Razones:**
- ✅ **Control total** - CRF, bitrate, resolución personalizados
- ✅ **No vendor lock-in** - Videos en repo
- ✅ **Gratis** - Sin costos de servicio
- ✅ **Privacidad** - No tracking de terceros
- ✅ **Performance** - No requests externos

**Configuración óptima encontrada:**
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \        # Mejor compresión
  -crf 25 \            # Balance calidad/tamaño
  -vf "scale=1280:720" \
  -movflags +faststart \
  -c:a aac -b:a 128k \
  output.mp4
```

**Resultado:** -90% tamaño (130MB → 13MB)

**Trade-off:**
- ❌ Proceso manual de optimización
- ✅ Script automatizado mitiga esto

### Imágenes: WebP vs AVIF

**Decisión:** WebP con Sharp

**Comparación:**

| Formato | Tamaño | Compatibilidad | Calidad | Velocidad |
|---------|--------|----------------|---------|-----------|
| JPG | 100% | 100% | Buena | Rápida |
| WebP | 30% | 97% | Excelente | Rápida |
| AVIF | 25% | 85% | Excelente | Lenta |

**Elección:** WebP

**Razones:**
- ✅ Balance perfecto tamaño/compatibilidad
- ✅ 97% browser support (suficiente)
- ✅ Encoding rápido con Sharp
- ✅ Calidad visual excelente

**Configuración Sharp:**
```javascript
await sharp(input)
  .resize(600, 600)
  .webp({
    quality: 85,    // Sweet spot
    effort: 6       // Max compression
  })
  .toFile(output);
```

**Resultado:** -84% tamaño (4.2MB → 0.7MB)

**Fallback para browsers viejos:**
```jsx
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." />
</picture>
```

---

## ⚖️ Trade-offs y Justificaciones

### 1. Bundle Size vs Features

**Trade-off:** React (40 KB) vs framework más ligero

**Decisión:** Priorizar React

**Justificación:**
- ✅ Beneficio en hiring (React muy demandado)
- ✅ Ecosistema de herramientas
- ✅ Code splitting mitiga tamaño
- ✅ 280 KB total aún es excelente

### 2. Spline External Service vs Self-hosted 3D

**Trade-off:** Dependencia externa vs control total

**Decisión:** Usar Spline

**Justificación:**
- ✅ Velocidad de desarrollo (no experto en Three.js)
- ✅ Calidad visual professional
- ✅ Preconnect mitiga latencia
- ✅ Cache browser hace segunda carga instantánea

**Riesgo mitigado:**
```html
<!-- Preconnect en index.html -->
<link rel="preconnect" href="https://prod.spline.design" />
```

### 3. Precarga Agresiva vs Bandwidth

**Trade-off:** Performance vs consumo de datos

**Decisión:** Precarga inteligente con 5 niveles

**Justificación:**
- ✅ Crítico (Spline) necesario siempre
- ✅ Alta prioridad (2 videos) razonable
- ✅ Prefetch respeta bandwidth (low priority)
- ✅ On-hover solo cuando usuario muestra interés
- ✅ Service Worker cache evita re-descargas

**Adaptive loading (futuro):**
```javascript
// Detectar conexión lenta
if (navigator.connection?.effectiveType === '3g') {
  // Solo precarga crítico
}
```

### 4. Custom i18n vs i18next

**Trade-off:** Features vs bundle size

**Decisión:** Custom

**Justificación:**
- ✅ Solo 2 idiomas (no necesita complejidad)
- ✅ +10 KB vs +70 KB con i18next
- ✅ Performance excelente
- ✅ Fácil de mantener

**Cuándo reconsiderar:**
- Agregar más de 3 idiomas
- Necesitar pluralización compleja

---

## 📊 Impacto Medido

### Antes vs Después (v1.0 → v2.4.0)

| Métrica | v1.0 | v2.4.0 | Mejora |
|---------|------|--------|--------|
| Lighthouse | 78 | 96 | +23% |
| FPS | 48 | 57 | +19% |
| Memoria | 125 MB | 88 MB | -30% |
| Bundle JS | 485 KB | 280 KB | -42% |
| Multimedia | 134 MB | 13.6 MB | -90% |
| LCP | 3.8s | 2.0s | -47% |
| Modal load | 8-10s | 0.5-2s | -85% |

### ROI de Decisiones

1. **Sistema de precarga custom** → -85% tiempo modal
2. **FFmpeg optimization** → -90% multimedia
3. **React memoization** → -60% re-renders
4. **Code splitting** → -42% bundle inicial
5. **WebP conversion** → -84% imágenes

---

## 🎓 Lecciones Aprendidas

### 1. Medir Antes de Optimizar

**Aprendizaje:** Chrome DevTools Performance tab es esencial

**Ejemplo:** Descubrí que partículas consumían 30% CPU solo al perfilar

### 2. Progressive Enhancement

**Aprendizaje:** Comenzar con básico, agregar features incrementalmente

**Ejemplo:** 
- v1.0: Solo animaciones básicas
- v2.0: Sistema de partículas optimizado
- v2.2: Precarga inteligente
- v2.4: Service Worker

### 3. Trade-offs Son Necesarios

**Aprendizaje:** No existe solución perfecta, evaluar pros/cons

**Ejemplo:** Spline (dependencia externa) vs Three.js (control total)
- Elegí velocidad de desarrollo > control absoluto

### 4. Documentar Decisiones

**Aprendizaje:** Este documento vale su peso en oro para entrevistas

**Beneficio:** Puedo explicar **por qué** tomé cada decisión, no solo **qué** hice

---

## 🔮 Evolución Futura

### Optimizaciones Consideradas (No Implementadas)

1. **AVIF images** - 5% mejora adicional, pero encoding lento
2. **Adaptive loading** - Detectar 3G/4G y ajustar precarga
3. **Web Vitals tracking** - Telemetría de usuarios reales
4. **Inline critical CSS** - -100ms FCP adicional
5. **HTTP/3** - Depende de hosting

**Razón para no implementar:** Ley de retornos decrecientes

**Lighthouse 96 → 99 requiere:**
- 5x esfuerzo
- Beneficio marginal
- Puede sobre-optimizar

**Decisión:** 96/100 es excelente, priorizar otros proyectos

---

## 📞 Contacto

Para discusiones técnicas o preguntas sobre decisiones:

**Mateo Dueñas**
- Email: mate.due02@gmail.com
- LinkedIn: [mateo-dueñas-andrade](https://linkedin.com/in/mateo-dueñas-andrade)
- GitHub: [majoduan](https://github.com/majoduan)

---

**Última actualización:** Noviembre 25, 2025  
**Versión del proyecto:** 2.4.0

---

*"Decisiones técnicas bien fundamentadas son la diferencia entre código que funciona y código que perdura."*

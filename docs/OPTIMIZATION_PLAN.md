# Plan de optimización — Portfolio v3.2 (septiembre 2026)

> Auditoría técnica + plan de acción. Basado en lectura completa del código (commit `37d6a6d`), build de producción local (`next build` 15.5.14), el deploy real en Vercel (`https://md-briefcase.vercel.app`) y una medición cuantitativa única del boot (build de producción servido en localhost, CPU emulada a 4x más lenta para simular un portátil medio). Los números de esa medición se usan solo como evidencia de tiempos y bytes, no para juzgar transiciones visuales; esas se validan a ojo con DevTools (sección 7).
>
> Regla del plan: **ninguna mejora reduce funcionalidad ni apariencia**. Cuando una técnica podría cambiar el look (p. ej. quitar `backdrop-blur`), se marca como *experimento A/B* y se decide con captura lado a lado.

---

## 0. Resumen ejecutivo

1. **El intro trabado no es culpa de Vercel.** Todo el sitio es estático (`○ Static`), servido desde el edge con `X-Vercel-Cache: HIT` y chunks `immutable`; no hay funciones serverless, así que no existe *cold start*. Lo que cambió entre ayer y hoy (mismo equipo, mismo navegador) fue la **caché del cliente**: HTTP cache, *code cache* de V8 (JS ya compilado), caché del Service Worker y caché de shaders de la GPU. Medido: con caché caliente el tiempo de hilo principal bloqueado durante el boot baja un 68 %.
2. **La causa raíz es estructural**: el boot screen vive en el hilo principal (React re-renderiza 484 nodos SVG en cada frame del orbe y cada 50 ms de progreso, con `filter: blur(3px)` sobre 72 trazos) **justo mientras ese mismo hilo compila 2 MB de runtime de Spline, hidrata la app y ejecuta imports de precarga**. Cualquier tarea larga congela los circuitos. Medido en frío: 48 frames perdidos que suman 6,3 s de los 9 s de boot.
3. **Después del boot hay dos congelaciones más** (2,7 s y 1,7 s en la medición): el parseo de la escena (9,18 MB descomprimidos) y la compilación de shaders WebGL ocurren cuando el usuario ya ve el hero. Por eso el typewriter y los contadores también "se pegan".
4. **Bugs de red graves y baratos de arreglar**: dos vídeos de 43 MB y 39 MB (1080p sin recomprimir) que se reproducen solos en `/projects`; la home precarga 6 vídeos completos (5,8 MB) sin que el usuario haga nada; canonical, sitemap y robots apuntan a `mateoduenas.vercel.app`, que responde 404. Con el plan Hobby (100 GB/mes) esto importa.
5. **Spline Pro/Max: no pagar por rendimiento.** El coste de la escena es parseo + GPU, no transferencia (2,08 MB brotli desde CloudFront en 0,4 s). Todo lo que mueve la aguja (decimar el maniquí, precargar la escena durante el boot, quitar el bloqueo del hilo principal, fallback inmediato) se hace gratis. Detalle en la sección 6.

Prioridad de ejecución: Fase 0 (1 día) → Fase 1 (2–3 días) → Fase 2 (1–2 días + trabajo en editor Spline) → Fase 3 → Fase 4 → Fase 5.

---

## 1. Entendimiento del proyecto

### 1.1 Objetivo y features
Portfolio personal (Mateo Dueñas, full-stack) orientado a reclutadores y a jurado tipo Awwwards. Tres rutas: `/` (hero con escena 3D, tecnologías con tabs auto-rotativos, marquee de integraciones, carrusel de certificados, proyectos destacados con modal y vídeo, contacto con formulario `mailto`), `/about` (globo WebGL de fondo con marcador en Quito, título rotativo, timeline de experiencia con línea SVG pintada por scroll, educación) y `/projects` (11 proyectos, cada uno con reproductor de vídeo custom, enlaces y chips de tecnologías). Transversal: tema oscuro/claro con *View Transition* de polígono, i18n EN/ES por JSON, PWA con Service Worker, boot screen de circuitos, partículas de fondo que reaccionan al ratón, efecto *typeface cycle* en el h1 (20 tipografías decorativas), botones `swap-btn` con barrido de icono.

### 1.2 Stack y estructura
Next.js 15.5 App Router (todo client components, prerender estático), React 18.3, Tailwind v4 (`@theme` + `@utility` en `globals.css`, sistema de espaciado centralizado), `@splinetool/react-spline` 4.1 + runtime 1.12.70, `cobe` para el globo, `lucide-react`, `geist`, 20 fuentes de Google vía `next/font` (`preload: false`). Sin librería de animación: CSS keyframes, transiciones, RAF y View Transitions API. Deploy en Vercel Hobby, proyecto `md-portfolio`, dominio público `md-briefcase.vercel.app`. pnpm.

Carpetas: `app/` (layout, providers, `BootScreenWrapper`, `template`, páginas), `components/` (secciones, boot, vídeo, timeline, 40+ iconos SVG), `contexts/AppContext.tsx` (tema, idioma, `isModalOpen`), `hooks/`, `utils/` (SW, precarga, vídeo adaptativo, telemetría sin destino), `data/`, `locales/`, `public/media` (109 MB, 107 MB son vídeos), `public/sw.js`.

### 1.3 Cómo funciona hoy la carga (secuencia real)
1. El HTML prerenderizado contiene **solo un `div` negro** (`BootScreenWrapper` devuelve el boot mientras `loading`, y el boot es `dynamic({ ssr:false })`). Sin h1, sin texto, sin hero en el HTML: LCP se pospone hasta después del boot y los crawlers ven una página vacía hasta ejecutar JS.
2. Se hidrata la app; `BootScreenWrapper` importa el módulo de Spline (`import('@splinetool/react-spline')`, 1,96 MB de JS, 515 KB brotli) y a los 3 s `preloadCriticalResources` importa `ProjectsSection` y `ContactSection`, inyecta 12 prefetch de imágenes, crea 2 `<video preload="metadata">` y a los 5 s prefetch de **6 vídeos completos**.
3. El boot avanza 2 %/50 ms hasta 85 %, luego se frena a 0,2 %/50 ms esperando `splineReady` (= módulo importado, **no** escena cargada), termina a 100 % y hace fade-out de 0,8 s. Ese frenazo 85→92 % es el "se paraba el avance" que se percibe aunque no haya jank.
4. Al terminar, se **monta toda la página** (hero, tech, marquee, certificados…) de golpe, con `portfolio-fade-in` de 2 s. Recién ahí `<Spline>` empieza a **descargar y parsear la escena** (9,18 MB descomprimidos / 2,08 MB brotli), compila shaders y muestra un spinner en el hueco 3D. En paralelo corren el typewriter (setState cada 30 ms), 3 contadores RAF, las partículas y el fade.
5. `GalaxyFallback` (reemplazo SVG de la escena) solo aparece si Spline no dispara `onLoad` en 10 s o falla al renderizar; en móvil (<768) no hay escena ni fallback. No se consulta la calidad de red para decidir.

### 1.4 Pantallas, transiciones y efectos (inventario)
| Elemento | Implementación | Coste principal |
|---|---|---|
| Boot screen | SVG procedural en React (35 circuitos + ramas, 484 nodos desktop / 155 móvil), orbe con `--orb-*` vía estado por frame, barra con `setInterval` 50 ms | Re-render React por frame + `filter: blur` en 72 paths; todo en hilo principal |
| Partículas | Canvas fijo, 20/8 partículas, trail con `destination-in`, 30 fps móvil, pausa por visibilidad y IntersectionObserver | Composite de canvas completo por frame; **no se pausa con el modal abierto** (IO no detecta oclusión) |
| Spline | Hero desktop/tablet, wrapper al 120 % del contenedor, `content-visibility:hidden` al salir del viewport, tema por eventos de teclado `0` | Canvas 44 % más grande de lo visible; escena 36 944 polígonos (78 % en el maniquí Ch36) |
| Tema | `flushSync` + `document.startViewTransition` + clip-path `reveal-dark/light` 0,7 s | Snapshot de página completa (normal) |
| Idioma | Contexto + JSON; `t()` memoizado por idioma | Re-render global (aceptable) |
| Typeface cycle | Cambia `font-family` del h1 en ráfagas; calibra tamaño por fuente (búsqueda binaria síncrona) | 20 familias, CSS de `@font-face` ≈ 90 KB sin comprimir; fuentes solo bajo demanda |
| Tech tabs | Doble grid (saliente/entrante) con keyframes y stagger; auto-rotación 7 s; medición de altura | `exp-tag-fill` anima `width` (layout) en 9 cards a la vez |
| Certificados | Scroll-snap manual + dots, auto-avance 4 s | Bajo |
| Marquee | `translateX(-50%)` 50 s con `mask-image` | Bajo |
| Proyectos home | Poster AVIF + vídeo 720p al hover (desktop), modal con focus-trap e `inert` | Descarga de vídeo completo por hover; modal `backdrop-blur-md` sobre partículas activas |
| `/projects` | 11 `ProjectVideo` con `preload="metadata"` y autoplay al 25 % visible | 107 MB potenciales; dos vídeos sin recomprimir |
| `/about` | `cobe` a pantalla de sección con DPR 2, marcador DOM proyectado por frame; timeline `useScrollPaint` | Fragment shader sobre toda la sección aunque solo se ve un círculo |
| Navegación | `template.jsx` fade 0,6 s; nav auto-oculto por dirección de scroll | Bajo |

---

## 2. Estado medido

### 2.1 Build de producción (local)
| Ruta | Route JS | First Load JS |
|---|---|---|
| `/` | 10,1 kB | 189 kB |
| `/about` | 14,2 kB | 145 kB |
| `/projects` | 6,7 kB | 183 kB |

Chunks diferidos relevantes: runtime Spline 1,96 MB raw / 515 KB br (se carga en home desktop); physics (rapier) 1,99 MB raw / 627 KB br y opentype 170 KB **no se descargan** con la escena actual (bien). CSS total 214 KB raw / ≈ 36 KB br en 5 archivos; uno de ≈ 94 KB es el `@font-face` de las 20 fuentes decorativas (169 woff2 en el build, 2,9 MB, de los que el navegador solo pide subsets latinos bajo demanda).

### 2.2 Boot y primeros segundos (producción local, CPU 4x, viewport 1440×900)
| Escenario | Fin del boot | Long tasks durante boot | Frames perdidos (>34 ms) durante boot | Congelaciones tras el boot | FPS medio del periodo |
|---|---|---|---|---|---|
| Desktop, caché fría | 9,0 s | 17 tareas, 3,8 s | 48, sumando 6,3 s (≈70 % del boot) | 2,7 s y 1,7 s (escena + shaders) | ≈16 |
| Desktop, caché caliente | 5,7 s | 16 tareas, 1,2 s | 42, sumando 2,9 s (≈50 %) | 1,2 s | ≈24 |
| Móvil 390×844, fría (sin Spline) | 7,0 s | 5 tareas, 2,7 s | 9, sumando 3,3 s | 1,9 s justo al terminar el boot (montaje + fade) | ≈31 |

Lectura: incluso con todo en caché el boot pierde la mitad de sus frames bajo CPU limitada, porque su coste propio (React + SVG + blur) ya es alto; la caché fría añade la compilación del runtime y duplica el daño. La tarea larga de 1,5 s a los 1,6 s del arranque coincide con la evaluación del chunk de Spline (descargado entre 1,08 s y 1,52 s).

### 2.3 Bytes por visita (home desktop, caché fría)
| Tipo | Peticiones | Transferido |
|---|---|---|
| JS | 23 | 2,7 MB |
| Vídeo (sin interacción) | 8 | 5,8 MB |
| Escena Spline (CloudFront) | 1 | 2,08 MB (9,18 MB decodificados) |
| Imágenes | 34 | 0,4 MB |
| CSS | 5 | 0,2 MB |
| **Total** | | **≈ 11 MB** |

Heap JS: 53 MB en frío, 92 MB tras recarga (escena + vídeos en memoria). `/projects` en desktop: 107 MB de vídeo en disco, dos archivos de 43,5 MB (1080p, 3,6 Mbps, 92 s) y 39,6 MB (1080p, 6,3 Mbps, 49 s). Con Hobby (100 GB/mes) bastan ≈ 9 000 visitas frías a la home o ≈ 1 000 recorridos completos de `/projects` para que Vercel pause el proyecto hasta el siguiente ciclo.

### 2.4 Deploy
`md-briefcase.vercel.app`: HTML 15,7 KB, `X-Vercel-Cache: HIT`, chunks `public,max-age=31536000,immutable` con brotli, vídeos `immutable` con `Accept-Ranges`. Escena en `prod.spline.design` vía CloudFront (PoP Bogotá), brotli, **sin `Cache-Control`** (el navegador aplica heurística; el SW la guarda con stale-while-revalidate). El canonical del HTML servido es `https://mateoduenas.vercel.app` → 404.

---

## 3. Diagnóstico del intro trabado

**Síntoma**: circuitos que avanzan a tirones, se detienen varias veces, el avance se siente rígido; un día mal, al siguiente fluido, mismo equipo y navegador.

**Causas, por peso:**
1. **Contención del hilo principal durante el boot** (la mayor). La animación depende del hilo principal en tres capas: React (`setOrbIntensity` por frame y `setProgress` cada 50 ms re-renderizan el árbol SVG completo, con objetos `style` nuevos por nodo), transiciones CSS de `stroke-dashoffset` (propiedad de *paint*, no compositada) y el `filter: blur(3px)` en cada trazo de brillo (re-rasterización por frame). Mientras tanto ese hilo compila y evalúa 2 MB de runtime Spline, hidrata React y ejecuta los `import()` de precarga. Cada tarea larga congela el SVG. La caché caliente elimina la compilación (V8 *code cache*), por eso hoy fue mejor; no es que ayer Vercel estuviera "frío".
2. **Frenazo de diseño en 85→92 %**: la barra pasa de 2 %/50 ms a 0,2 %/50 ms esperando el módulo. Con caché fría ese tramo dura lo que tarde la descarga y compilación, y se percibe como "se para".
3. **Post-boot**: la escena se descarga y parsea después del boot, en el momento de máxima actividad visual (fade-in, typewriter, contadores, partículas). La compilación de shaders y la subida de geometría (28 880 polígonos del maniquí) bloquean 1–3 s. La caché de shaders de la GPU y la caché del SW explican también la mejora del segundo día.
4. **Contención de red post-boot**: 6 vídeos prefetch (5,8 MB) compiten con la escena (2 MB) por ancho de banda justo cuando el usuario mira el hueco 3D con spinner.
5. Factores de máquina (batería/power saver, otras pestañas, GPU integrada) amplifican 1 y 3 pero no los crean.

**Sobre Vercel Hobby**: no interviene. Todo es estático y cacheado en el edge; la única penalización de "primer visitante tras deploy en una región" son decenas de milisegundos de origen, no segundos de jank. Donde Hobby sí importa es en el **presupuesto de 100 GB/mes** (sección 2.3) y en que **no se pueden desplegar actualizaciones** si se excede.

---

## 4. Principios del plan
- La apariencia y las features se conservan al 100 %. Se cambia *cómo* se logra el mismo resultado (dónde corre, cuándo se carga, cuánto cuesta por frame).
- El boot screen sigue siendo obligatorio en cada carga dura (decisión tuya), pero pasa a ser un **preloader real**: fluido aunque el hilo principal esté ocupado, con progreso ligado a eventos reales, y termina cuando la escena 3D está lista (o cuando el presupuesto de tiempo se agota y entra el fallback ya visible).
- El fallback de la escena (GalaxyFallback) deja de ser un "plan B tras 10 s" y pasa a ser el estado inicial visible que se **funde** con la escena cuando llega; en redes lentas/`saveData`/equipos débiles se queda.
- Cada fase se mide antes y después con la misma receta (sección 7) y deja un commit aislado.

---

## 5. Plan por fases

### Fase 0 — Correcciones urgentes (≈ 1 día, riesgo nulo)

| # | Qué | Por qué | Cómo |
|---|---|---|---|
| 0.1 | Canonical, OG `url`, `metadataBase`, `sitemap.js`, `robots.txt` → `https://md-briefcase.vercel.app` | Hoy apuntan a un deploy que responde 404: Google puede consolidar señales hacia una URL muerta | Un solo `SITE_URL` en `lib/site.js` y consumirlo en `layout.jsx`, `sitemap.js`; editar `public/robots.txt` |
| 0.2 | Recomprimir `crumb-coach.mp4` y `connect-invest-marketing.mp4` con el mismo pipeline que los otros 9 (`scripts/reencode-desktop-videos.mjs`: 720p, CRF 28, `+faststart`, audio AAC 96–128 kbps) | 83 MB → ≈ 6–9 MB sin cambio perceptible en un reproductor de ≤ 700 px de ancho; hoy cada visita a `/projects` en desktop puede costar 80 MB | `ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -preset slow -crf 28 -movflags +faststart -c:a aac -b:a 128k out.mp4`. Comprobar `faststart` (átomo `moov` al inicio) para que `preload="metadata"` no baje el archivo entero |
| 0.3 | Quitar el prefetch de 6 vídeos y los 2 `<video preload="metadata">` huérfanos de `preloadCriticalResources` | 5,8 MB por visita sin interacción; compiten con la escena; el SW ya cachea bajo demanda al primer play | Dejar solo los `import()` de secciones y los prefetch de posters; mover cualquier prefetch de vídeo a `requestIdleCallback` **después** de `onLoad` de Spline y solo si `!connection.saveData && effectiveType === '4g'` |
| 0.4 | Borrar `components/HUDBootScreen.css` (714 líneas, clases `.hud-*` sin uso) y `components/AnimatedCounter.jsx` (sin importadores) | Código muerto; el CSS no se importa pero confunde | `git rm` |
| 0.5 | `public/offline.html` referencia `/bow-and-arrow.svg` (ruta real `/icons/bow-and-arrow.svg`); `manifest.json` con `background_color #0f172a` y `theme_color #3b82f6` (la app usa `#171717`); notificación de actualización del SW con paleta índigo antigua | Splash de PWA y offline con colores/iconos de otra versión | Alinear a tokens actuales |
| 0.6 | Cabeceras: eliminar `X-XSS-Protection` (obsoleta, puede introducir vulnerabilidades en navegadores viejos), dejar una sola fuente de cabeceras (`next.config.mjs`; `vercel.json` duplica y Vercel envía ambas) | Mantenimiento doble | Borrar el bloque `headers` de `vercel.json` |
| 0.7 | Envolver en `try/catch` el script inline de tema/idioma del `<head>` | `localStorage` lanza en Safari privado o con almacenamiento bloqueado → flash de tema | 3 líneas |
| 0.8 | Enlaces sociales inconsistentes: hero/about/footer usan `github.com/mateo-dueñas` y `mateo.duenas@epn.edu.ec`; contacto usa `majoduan` y `mate.due02@gmail.com` | Un reclutador puede caer en un perfil inexistente | Centralizar en `data/social.js` |

### Fase 1 — Boot screen "real" (≈ 2–3 días, el cambio de mayor impacto)

**Objetivo**: mismo look (circuitos, orbe, barra, fade), pero (a) inmune al hilo principal, (b) con la página real montándose debajo desde el primer instante, (c) progreso ligado a hitos reales y (d) terminando cuando la escena 3D está lista o el presupuesto se agota.

1.1 **Arquitectura overlay**. `BootScreenWrapper` deja de devolver *o* boot *o* página: renderiza siempre `<main>` + partículas + nav, y encima el boot como overlay `fixed` `z-index 9999`. Consecuencias:
- El HTML prerenderizado contiene el hero completo (h1, texto, CTA) → SEO y LCP reales; el overlay opaco no impide que el navegador contabilice el LCP del contenido de debajo.
- `<Spline>` se monta debajo del overlay y empieza a descargar/parsear la escena **durante** el boot (para eso existe un preloader).
- El fade final funde el overlay sobre una página ya renderizada y con la escena lista: desaparece el spinner del hero y la congelación post-boot deja de coincidir con las animaciones de entrada.
- Hidratación: como el hero ahora se SSR-iza, `theme`/`language` no pueden leerse de `localStorage` durante el render inicial sin *mismatch*. Usar `useSyncExternalStore` con `getServerSnapshot` fijo (`dark`/`en`) y sincronizar en el cliente, o inicializar desde el `data-theme` que ya escribe el script inline (`document.documentElement.classList.contains('dark')`) dentro de `useState(() => …)` con `suppressHydrationWarning` en los nodos que dependen de ello (iconos de toggles, texto EN/ES). El script inline ya evita el flash visual.
- Accesibilidad: `aria-busy="true"` en `<main>` mientras el overlay esté, `inert` en `<main>` para que Tab no entre debajo, y `role="progressbar"` con `aria-valuenow` en la barra.

1.2 **Animación fuera del hilo principal**. Sustituir el SVG-en-React por un `<canvas>` cuya propiedad se transfiere a un **Web Worker** con `OffscreenCanvas` (`canvas.transferControlToOffscreen()`); el worker corre su propio `requestAnimationFrame`, genera los circuitos con el mismo `generateCircuits` (mover las funciones puras a `lib/boot/circuits.js` para compartirlas) y dibuja:
- trazo principal (1,2 px, blanco 0,8) con avance por longitud (`setLineDash` + `lineDashOffset`, idéntico al `stroke-dashoffset` actual),
- brillo: en lugar de `filter: blur(3px)` por path, un segundo trazo de 3 px con `globalAlpha 0,25` y `shadowBlur 3` solo en la porción visible, o dos trazos anchos a baja alfa (visualmente equivalente sobre negro y decenas de veces más barato),
- puntos de unión y finales con fade por tiempo (mismos delays),
- orbe: gradiente radial + sombras con la misma curva `flicker → ramp` (700 + 500 ms), calculada en el worker a partir del tiempo, no de estado React,
- barra y texto `INITIALIZING… NN %` pueden quedarse en DOM (baratos) o dibujarse también en el canvas; recomendación: DOM, actualizados por `postMessage` desde el orquestador.
- Fallback sin `OffscreenCanvas` (Safari < 16.4, navegadores antiguos): el mismo módulo de dibujo se ejecuta en el hilo principal sobre el canvas normal (misma API 2D), sin React por frame. Se mantiene `prefers-reduced-motion` (frame estático + cierre 500 ms). El worker se sirve desde el propio origen (`worker-src 'self' blob:` ya está en la CSP).
- DPR: dibujar a `min(devicePixelRatio, 2)` para que los trazos se vean igual de nítidos que el SVG.

1.3 **Progreso ligado a hitos reales** (orquestador en `BootScreenWrapper`, sin `setInterval` ciego):
- 0→15 %: CSS + hidratación (`useEffect` del wrapper).
- 15→40 %: chunk del runtime Spline importado (solo home desktop; en móvil este tramo se reparte entre fuentes críticas e imágenes del primer viewport).
- 40→85 %: **descarga de la escena con progreso real**: `fetch(sceneUrl)` leyendo el `ReadableStream` (usa `Content-Length` cuando venga; si no, estimación por bytes conocidos: 2,08 MB) y guardando la respuesta en la Cache API (`caches.open('spline-scene')`). El runtime pide la misma URL después; el SW/`caches.match` responde al instante → el runtime no vuelve a descargar. Alternativa más simple si no se quiere tocar el SW: `<link rel="preload" as="fetch" crossorigin="anonymous" href="…scene.splinecode">` en el `<head>` (mismo modo CORS que usa el runtime) y progreso estimado por tiempo.
- 85→100 %: `onLoad` de Spline (escena parseada, shaders compilados). Interpolar suavemente entre hitos (easing por tiempo dentro de cada tramo) para que la barra nunca "salte" ni se pare en seco.
- Presupuestos: mínimo 2,5 s (el intro es firma visual), máximo 8 s en desktop; si `onLoad` no llega, el boot termina igual y debajo ya está el fallback (Fase 2.2). En móvil, sin escena, el boot dura el mínimo + lo que tarden hidratación y fuentes críticas.

1.4 **Descargar trabajo del hilo principal durante el boot**: retrasar `import()` de `ProjectsSection`/`ContactSection` y los prefetch de posters a `requestIdleCallback` **posterior** al `onLoad` de Spline (hoy caen a los 3 s, en mitad del boot); mantener `preload: false` de fuentes decorativas; iniciar el typewriter, contadores y el typeface cycle **solo cuando el overlay termina** (hoy arrancan al montar y compiten con el parseo de la escena).

1.5 **Fade-in post-boot** (`portfolio-fade-in` 2 s + `page-transition`): mantener, pero como transición de `opacity` en el contenedor (compositada); evitar que coincida con `setState` masivos (1.4 lo garantiza).

Verificación: DevTools Performance con CPU 4x y "Disable cache" → durante el boot no debe haber frames del overlay > 34 ms aunque existan long tasks; el spinner del hero no debe aparecer nunca; LCP en Lighthouse ≤ 2,5 s móvil.

### Fase 2 — Escena 3D: carga, fallback y peso (≈ 1–2 días + sesión en el editor Spline)

2.1 **Decisión previa de calidad (sin esperar 10 s)**. Nuevo `lib/scenePolicy.js` que decide `spline | galaxy` antes de montar el hero: `galaxy` si `navigator.connection.saveData`, `effectiveType` ∈ {`slow-2g`,`2g`,`3g`}, `navigator.deviceMemory ≤ 2`, `hardwareConcurrency ≤ 2`, `matchMedia('(prefers-reduced-data: reduce)')`, sin WebGL2, o si la última carga registrada en `localStorage` tardó > 8 s. La decisión se cachea por sesión y se puede forzar con `?scene=3d|galaxy` para pruebas.

2.2 **Fallback inmediato y fundido**. `GalaxyFallback` se renderiza desde el primer frame en el hueco 3D (es SVG barato) y la escena Spline se monta encima con `opacity 0`; en `onLoad` se cruza con una transición de 600 ms. Si el timeout (bajar a 8 s) vence, la galaxia se queda; si la escena termina de cargar después, **también se cruza** (hoy `splineFailed` la descarta para siempre aunque llegue).

2.3 **Tamaño del canvas**. El wrapper interno `w-[120%] h-[120%]` hace que el runtime renderice un 44 % más de píxeles de los visibles (con DPR 2 en un contenedor de 720 px son ≈ 3 M px por frame). Si el 120 % existe para encuadrar el modelo, mover ese encuadre a la cámara de la escena en el editor y dejar el wrapper al 100 %. Además fijar `devicePixelRatio` efectivo a `min(dpr, 1.5)` para la escena (una escena con sombras suaves no muestra diferencia a 1,5 en un panel de 700 px; validar a ojo).

2.4 **Pausa real fuera de viewport**. `content-visibility: hidden` ya evita el paint, pero el bucle del runtime sigue; en el IntersectionObserver del hero llamar `spline.stop()` / `spline.play()` (API del runtime) y en `visibilitychange`. Mantener `renderOnDemand` (por defecto `true` en react-spline) y, con el runtime ≥ 1.9, usar `renderMode: 'auto'`.

2.5 **Tema sin eventos de teclado**. El toggle de tema hoy despacha `keydown/keyup` de la tecla `0` en `document` para que la escena cambie. Es frágil (cualquier input con foco lo recibe). Con la referencia `spline` de `onLoad`: `spline.setVariable('theme', 1|0)` si la escena expone una variable, o `spline.emitEvent('keyDown', 'NombreObjeto')`. Requiere ajustar la escena en el editor (evento por variable en vez de tecla).

2.6 **Optimizar la escena en el editor (gratis)**: decimar el maniquí Ch36 (28 880 → ≈ 10 000 polígonos conservando rig), *bake* de animaciones predecibles, revisar texturas > 1024 px, comprobar que no se incluyan objetos ocultos. Meta: Loading Score ≥ 50 y ≤ 5 MB decodificados → parseo y subida a GPU la mitad de largos. Reexportar y actualizar la URL (o mantenerla si el editor republica).

2.7 **Runtime**. Instalado 1.12.70; existe 2.0.x (WebGPU con fallback WebGL, según docs). Probar en rama: si la escena carga y el tema responde, medir tiempo `onLoad` y FPS; si no, quedarse en 1.x. `react-spline` acepta cualquier runtime (`peer: *`).

2.8 **Cache de la escena**. Sin `Cache-Control` en CloudFront, el SW es la única garantía. Reglas: `spline-scene` cache con SWR y límite de 2 entradas; invalidar cuando cambie la URL. Con la precarga por `fetch` de 1.3 la escena queda en Cache Storage desde el primer boot.

### Fase 3 — Red: vídeo, fuentes, precarga, Service Worker, cabeceras (≈ 1–2 días)

3.1 **Vídeo con fuente según tamaño real**. Elegir `-mobile.mp4` (480p) también en desktop cuando el ancho renderizado × DPR ≤ 960 px (cards de la home, modal en portátiles pequeños) y el 720p cuando sea mayor; medir con `ResizeObserver` en `ProjectVideo`/`ProjectCard`. Cero pérdida visible: nunca se sirve menos resolución que la que el elemento puede mostrar.

3.2 **Codec moderno con fallback**. Generar `.webm` AV1 (`libsvtav1 -crf 35 -preset 6`) o VP9 de cada vídeo y servir `<video><source type="video/webm; codecs=av01…"><source type="video/mp4"></video>`: 30–50 % menos bytes a igual calidad en Chrome/Edge/Firefox; Safari sigue con H.264. Script nuevo en `scripts/` reutilizando el de reencode.

3.3 **Política de reproducción en `/projects`**: mantener autoplay al 25 % visible, pero `preload="none"` + poster hasta que el IO lo active (hoy `metadata` dispara 11 peticiones al entrar); pausar y liberar (`video.src=''; load()`) los que salgan del viewport para bajar memoria (hoy 11 elementos vivos).

3.4 **Fuentes decorativas**: el h1 solo muestra "Full-Stack Developer" / "Desarrollador Full-Stack". Subconjuntar las 20 familias a esos glifos (+ básicos) con `pyftsubset --text="…" --flavor=woff2` y cargarlas con `next/font/local` (`preload:false`, `display:swap`): cada archivo pasa de 15–60 KB a 2–5 KB y el CSS de `@font-face` de ≈ 90 KB a ≈ 3 KB (ese CSS bloquea el render en todas las rutas). El efecto es idéntico.

3.5 **Service Worker**: reemplazar el `sw.js` manual por **Serwist** (sucesor de Workbox para Next.js): manifiesto de precache generado del build (HTML + chunks coherentes, evita el riesgo actual de servir un HTML en caché que referencia chunks de otro deploy cuando `networkFirst` cae al timeout de 3 s), `navigationPreload`, rutas runtime para `prod.spline.design` (SWR), imágenes (cache-first 30 d), vídeos (range requests con `RangeRequestsPlugin`, sin `cache.put` de archivos de 40 MB), y versión automática por build. Mantener `offline.html`.

3.6 **Cabeceras y CSP**: probar si `'unsafe-eval'` puede sustituirse por `'wasm-unsafe-eval'` (el runtime carga WASM para physics/compresión, no `eval`); si la escena carga sin errores en consola, dejar la CSP más estricta. Añadir `Cache-Control` explícito a `/docs/*.pdf` con `stale-while-revalidate`.

3.7 **Imágenes**: ya en AVIF con `srcset`. Único ajuste: `fetchPriority="high"` en la foto de contacto está por debajo del pliegue; quitarlo y reservarlo para el poster del primer proyecto o nada (LCP será el h1 tras la Fase 1).

### Fase 4 — Rendimiento en ejecución (≈ 1–2 días)

4.1 **Partículas y modal**: `ParticleCanvas` se suscribe a `isModalOpen` del contexto y pausa el RAF (el `IntersectionObserver` no detecta oclusión; hoy el `backdrop-blur-md` del modal re-desenfoca un canvas que cambia 60 veces por segundo). Igual con `document.startViewTransition` en curso (pausar 0,7 s).

4.2 **Experimento A/B `backdrop-filter`** (solo si la medición lo justifica): cards de tecnologías (`backdrop-blur-sm`), certificados/contacto (`backdrop-blur-lg`) y nav (`backdrop-blur-md`) se desenfocan sobre el canvas de partículas en cada frame. Capturar frame con y sin blur (con fondo `bg-white/95` en lugar de `/90`) y comparar en zoom; si son indistinguibles, quitar el blur en las cards y dejarlo en nav y modal. Se decide con la captura, no a priori.

4.3 **Hero sin `setState` por tick**: typewriter escribiendo en un `ref` (`textNode.data = …`) con RAF y sin re-render; `useCountUp` con `requestAnimationFrame` escribiendo `textContent`; ambos arrancan al terminar el overlay (Fase 1.4). Mismo resultado visual, cero renders de `HeroSection` durante los primeros 4 s.

4.4 **Tech cards**: `exp-tag-fill` anima `width` (layout + paint en 9 cards por cambio de tab). Sustituir por `clip-path: inset(0 100% 0 0 → 0)` sobre el mismo `span` de gradiente: mismo relleno de píldora, sin layout. El `transition-all duration-300` en cards y botones se acota a `transition-[transform,box-shadow,border-color]`.

4.5 **Globo de `/about`**: el canvas de `cobe` ocupa toda la sección con DPR 2 y una máscara radial deja visible solo el círculo. Redimensionar el canvas al cuadrado del globo (centrado con CSS) y `dpr = min(devicePixelRatio, 1.5)`: mismos píxeles visibles, 60–70 % menos trabajo de shader. Mantener `mapSamples` actuales.

4.6 **Capas GPU innecesarias**: `transform: translateZ(0)`, `backface-visibility: hidden` y `will-change` fijos en inputs, párrafos del modal, vídeos y cards crean capas compositadas permanentes (memoria GPU y repintados). Dejar `will-change` solo en `:hover` (ya está en algunos) y quitar el resto; verificar con DevTools → Layers que el número de capas baja.

4.7 **`transition-colors duration-300` en `<section>` y en el contenedor raíz**: el cambio de tema ya lo anima la View Transition; estas transiciones de 0,3 s crean un doble fundido y se aplican a decenas de nodos. Quitar en secciones, mantener en el `html/body`.

4.8 **Modal de proyectos**: `content-visibility: auto` en `.project-modal` (que es `fixed` y siempre visible) no aporta; retirar. Mantener focus-trap e `inert`.

4.9 **TechnologiesSection**: `handleResize` sin debounce hace `setIsMobile` por evento; unificar con `matchMedia('(min-width:768px)')` como ya hace `BootScreenWrapper`.

### Fase 5 — Plataforma y medición continua (≈ 1 día + continuo)

5.1 **Datos de usuarios reales**: `@vercel/speed-insights` y `@vercel/analytics` (gratis en Hobby) sustituyen a `utils/telemetry.js` (hoy observa métricas y no las envía a ningún sitio). Permite ver LCP/INP/CLS por dispositivo y confirmar en producción que la Fase 1 elimina las tareas largas.

5.2 **Presupuestos en CI**: `pnpm analyze` ya existe; añadir Lighthouse CI (`lhci autorun` contra `next start`) con umbrales: First Load JS `/` ≤ 190 kB, LCP móvil ≤ 2,5 s, TBT ≤ 150 ms, CLS 0. Reusar `.benchmarks/` como baseline.

5.3 **Next 16 + React 19.2 (opcional, rama aparte)**: React Compiler (memoización automática, elimina `useMemo/useCallback` manuales), `<ViewTransition>` nativo para el cambio de tema y las transiciones de ruta, `<Activity>` para pre-renderizar secciones ocultas, Turbopack en build. Requiere migrar el alias webpack de react-spline a `turbopack.resolveAlias` y revisar `modularizeImports` (Next 16 usa `optimizePackageImports`). Hacerlo después de las fases 1–4 para no mezclar causas al medir.

5.4 **Mantener**: migración gradual a TypeScript (hooks ya migrados), `README` alineado con el stack real, y borrar de `docs/` los informes de auditoría ya integrados.

---

## 6. ¿Pagar Spline para tener el código de la escena?

**Recomendación: no, al menos no por rendimiento.**

- Lo que pagarías: según la página de precios (sept. 2026) la **descarga del code export** está en el tier **Max** (60 $/mes anual, 70 $ mensual) y el "Self-Hosted Export" solo en **Enterprise**; Hobby (12 $) y Pro (25 $) quitan la marca de agua pero no incluyen la descarga. Confírmalo en tu cuenta, los tiers han cambiado varias veces.
- Lo que obtendrías: el mismo `@splinetool/react-spline` que ya usas más el archivo `.splinecode` para servirlo desde Vercel. Ventaja real: control de `Cache-Control` y precache trivial. Pero hoy la escena llega desde CloudFront (PoP Bogotá) en 0,4 s con brotli, y el SW ya la cachea; **el coste que sientes es parseo de 9 MB + compilación de shaders, y eso no cambia por moverla de servidor**.
- Lo que sí mueve la aguja y es gratis: decimar el maniquí (2.6), precargar la escena durante el boot con progreso real (1.3), sacar el boot del hilo principal (1.2), fallback inmediato (2.2), canvas al 100 % y DPR 1,5 (2.3).
- Cuándo sí tendría sentido pagar: si vas a iterar la escena a menudo y quieres versionarla con el repo, si necesitas dos calidades (low-poly para tablets) o si Spline te obliga a marca de agua que no aceptas. En ese caso el tier mínimo que resuelve la descarga es Max, no Pro.
- Alternativa a medio plazo si la escena sigue pesada tras 2.6: exportar a glTF con Draco y renderizar con `three.js`/R3F (escena ≈ 1–3 MB, runtime ≈ 150 KB br frente a 515 KB). Pierdes el editor visual; solo si las fases 1–2 no bastan.

---

## 7. Cómo medir cada fase (sin Playwright, a ojo + DevTools)

1. Chrome incógnito, `pnpm build && pnpm start`, DevTools → Performance, CPU **4x slowdown**, Network **Fast 4G**, casilla **Disable cache** para "caché fría"; repetir sin la casilla para "caliente".
2. Grabar desde antes de recargar hasta 5 s después del boot. Mirar: pista *Frames* (rojo = frame perdido) durante el boot, *Long tasks* (bloques rojos), y el instante en que aparece el canvas de Spline.
3. Rendering → **Frame Rendering Stats** para FPS en vivo mientras ves el intro y el hero; **Paint flashing** para detectar repintados (marquee, partículas bajo blur).
4. Layers panel: contar capas antes/después de 4.6.
5. Lighthouse (móvil y desktop) por ruta; guardar en `.benchmarks/<fecha>/` como ya hace el baseline de abril.
6. Network: filtrar `media` para confirmar que en la home no se descarga ningún `.mp4` sin interacción y que en `/projects` solo se pide el vídeo visible.
7. Producción: Speed Insights (5.1) tras cada deploy.

Aceptación de la Fase 1: con CPU 4x y caché fría, cero frames rojos en el overlay del boot; sin spinner en el hero; LCP móvil ≤ 2,5 s.

---

## 8. Riesgos y notas
- **Hidratación** (Fase 1.1): el mayor riesgo técnico. Probar en dark/light y en EN/ES con recarga dura; buscar warnings de mismatch en consola.
- **OffscreenCanvas**: Safari ≥ 16.4 y Firefox ≥ 105; el fallback a canvas en hilo principal cubre el resto sin cambiar el diseño.
- **CSP**: el worker debe servirse desde `self` (no `blob:` generado en runtime) para no relajar la política; ya permitido.
- **Serwist**: al cambiar de SW hay un ciclo de actualización; el `CACHE_VERSION` nuevo invalida el anterior. Probar el flujo "versión nueva disponible".
- **Vídeos AV1**: verificar que el `<source>` mp4 quede segundo y que Safari no intente el webm.
- **Escena Spline en 2.x**: puede no cargar; se prueba en rama.
- **Apariencia**: cualquier cambio de la Fase 4.2 requiere captura comparativa antes de mergear.

## 9. Decisiones que quedan en tu mano
- Fase 1: mínimo del boot (propuesto 2,5 s) y máximo (8 s desktop).
- Fase 2.1: umbrales de la política (`3g` → galaxia, `deviceMemory ≤ 2`).
- Fase 3.2: aceptar mantener dos formatos de vídeo por proyecto (22 archivos más en `public/`).
- Fase 5.3: cuándo abrir la rama Next 16 / React 19.

## 10. Estado de ejecución (2026-09-08)

Commits en `main` (sin push): `a74584e` Fase 0 · `e8054a9` Fase 1 · Fases 3–5 en el commit siguiente. Medición con el build de producción en localhost (Playwright solo para números).

| Métrica | Antes | Después |
|---|---|---|
| Frames perdidos del boot (overlay), caliente, CPU 4x | 42 huecos (2,9 s de 5,7 s) | **0** (peor hueco 17 ms) con 3–5 s de tareas largas en el hilo principal |
| Frames perdidos del boot, frío, CPU 4x | 48 huecos (6,3 s de 9 s) | 4 huecos, peor 250 ms (contención por el parseo de la escena) |
| Escena lista al levantar el overlay | No: spinner + congelaciones de 2,7 s y 1,7 s tras el boot | Sí: escena a 1,3 s, overlay a 2,8 s (desktop 1x); 8 s máximo con galaxia visible debajo |
| HTML prerenderizado de `/` | 15,7 KB, solo un `div` negro | 108 KB con h1, hero, proyectos (SEO/LCP reales) |
| Bytes por visita fría a la home (desktop) | ≈ 11 MB (5,8 MB de vídeo prefetch) | ≈ 5,8 MB (0 vídeo; JS 2,7 · escena 2,08 · img 0,4 · CSS 0,2 · fuentes 0,36 tras el boot) |
| Vídeos en disco | 107 MB (2 archivos de 43,5 y 39,6 MB, sin faststart en 13) | 35 MB (4,6 y 4,0 MB; faststart en los 22) |
| `/projects` al entrar (desktop) | 11 vídeos con `preload=metadata`, 720p siempre | Solo el visible se descarga; fuente por ancho real × DPR (480p si ≤ 854 px físicos, nunca reescalado hacia arriba) |
| CSS total / CSS de fuentes | 214 KB raw / 94 KB (19 KB br) | 112 KB raw / 7 KB (1 KB br) |
| Fuentes decorativas en el build | 169 woff2, 2,9 MB | 21 woff2, 408 KB (subconjuntos) |
| Service Worker | Manual, `networkFirst` 3 s (riesgo de HTML de otro build); además **no se registraba** cuando `load` disparaba antes de montar el efecto | Serwist: precache de 48 entradas coherente con el build (sin runtime Spline ni media), reglas para escena/vídeo/imágenes/PDF, `navigationPreload`; carrera de `load` corregida |
| CSP | `'unsafe-eval'` | `'wasm-unsafe-eval'` (verificado sin violaciones) |
| Errores de hidratación | — (no había SSR de contenido) | 0 con tema/idioma vía `useSyncExternalStore` |

Decisiones tomadas durante la ejecución:
- **AV1/WebM (3.2)**: probado con SVT-AV1 CRF 34 preset 6. Los MP4 ya están en el suelo de bitrate (grabaciones de pantalla, CRF 28) y a calidad equivalente el AV1 salió **mayor** en 18 de 22; se conservan los 4 que sí son más pequeños (`data/webm-manifest.json`). Sin pérdida de calidad no hay más margen por codec.
- **Runtime Spline 2.x (2.7)**: descartado (rompe el build con webpack, exige abrir la CSP a cdn.spline.design/gstatic/…); instalado 1.12.98. La escena está exportada con editor 2.x (aviso inofensivo en consola).
- **Cap de DPR en la escena (2.3)**: no posible sin API del runtime (lee `window.devicePixelRatio`). Wrapper al 120 % se mantiene hasta ajustar la cámara en el editor.
- **`backdrop-filter` A/B (4.2)**: no aplicado; requiere decisión visual.
- **Partículas**: pausadas con el modal abierto y durante el wipe de tema (sin cambio visual).
- **Globo de `/about`**: canvas cuadrado (lado = alto) centrado; el shader de cobe dimensiona la esfera por la altura y la máscara vive en el wrapper, así que se ve idéntico con ~60 % menos píxeles.

Pendiente que depende de ti: revisión visual (boot con halo aproximado sin `blur()`, fundido galaxia→escena, arranque de typewriter/contadores/typeface al levantar el overlay, cambio de tema con la escena), trabajo en el editor Spline (decimar Ch36, cámara para wrapper 100 %, variable de tema), decisión sobre Next 16 (rama aparte), y `pnpm lhci` para fijar el baseline de Lighthouse CI (`lighthouserc.json`).

## Apéndice — archivos por fase
- Fase 0: `app/layout.jsx`, `app/sitemap.js`, `public/robots.txt`, `public/media/projects/videos/*`, `utils/preloadResources.js`, `components/HUDBootScreen.css` (borrar), `components/AnimatedCounter.jsx` (borrar), `public/offline.html`, `public/manifest.json`, `utils/registerSW.js`, `next.config.mjs`, `vercel.json`, `data/social.js` (nuevo).
- Fase 1: `app/BootScreenWrapper.jsx`, `components/HUDBootScreen.jsx` → `components/boot/BootOverlay.jsx` + `lib/boot/circuits.js` + `workers/boot-renderer.js`, `contexts/AppContext.tsx` (hidratación), `components/sections/HeroSection.jsx`, `app/globals.css` (`.cb`).
- Fase 2: `lib/scenePolicy.js` (nuevo), `components/sections/HeroSection.jsx`, `components/GalaxyFallback.jsx`, `app/globals.css` (`.spline-container`), `public/sw.js`/Serwist, editor Spline.
- Fase 3: `components/ProjectVideo.jsx`, `components/sections/ProjectsSection.jsx`, `utils/adaptiveVideo.js`, `scripts/` (AV1, subset de fuentes), `lib/heroFonts.js`, `public/sw.js` → Serwist, `next.config.mjs`.
- Fase 4: `components/sections/ParticleCanvas.jsx`, `components/sections/HeroSection.jsx`, `hooks/useCountUp.ts`, `components/TechCard.jsx`, `components/sections/TechnologiesSection.jsx`, `components/sections/AboutGlobe.jsx`, `app/globals.css`.
- Fase 5: `app/layout.jsx` (Speed Insights), `package.json`, `lighthouserc.json` (nuevo), `utils/telemetry.js` (retirar).

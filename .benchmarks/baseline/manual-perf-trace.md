# Manual Performance Trace — Instrucciones para baseline

Lighthouse cubre Core Web Vitals de forma automatizada pero no mide **FPS sostenido** del canvas de partículas ni **long tasks durante interacción**. Estas mediciones requieren DevTools Performance panel y deben ejecutarse manualmente antes de pasar a Fase 1.

## Setup

1. Servidor de producción corriendo en `http://localhost:3000` (`pnpm start`).
2. Chrome en **modo incógnito** (sin extensiones) — menú → Nueva ventana incógnito.
3. DevTools abierto (F12) → tab **Performance** y tab **Rendering** (en el menú `⋮` → More tools → Rendering).
4. En Rendering: activar "Frame Rendering Stats" (muestra HUD FPS en la esquina).

## Trace 1 — FPS de partículas en Hero (desktop)

1. Ir a `http://localhost:3000/` y **esperar** a que el HUDBootScreen termine (≥ 3 s).
2. En Performance: clic grabar (círculo rojo), mover el mouse sobre el canvas durante **10 s**, parar.
3. Anotar en `baseline-metrics.md`:
   - FPS promedio mostrado en HUD.
   - Suma de "Long tasks" (> 50 ms) en el bottom summary.
   - "Scripting" vs "Rendering" ms.

**Meta post-optimización (Fase 1):** FPS ≥ 55 desktop, long tasks < 50 ms durante resize.

## Trace 2 — FPS de partículas en Hero (mobile emulado)

1. DevTools → device toolbar (Ctrl+Shift+M) → seleccionar "iPhone 14" o similar.
2. CPU throttle: **4x slowdown**. Network: **Fast 3G**.
3. Reload, esperar boot, grabar **10 s** con interacciones táctiles simuladas (drag).
4. Anotar FPS + long tasks.

**Meta post-optimización:** FPS ≥ 28 (≥ 30 fps es el target mobile tras skip-frame).

## Trace 3 — Resize jank (hallazgo #7)

1. Desktop, ventana en 1440×900, Performance grabando.
2. Arrastrar el borde derecho hacia 800 px y de vuelta a 1440 rápidamente **10 s**.
3. Anotar:
   - Cantidad de "Layout" / "Recalc Style" events.
   - FPS mínimo durante resize.
   - Número de "Long Task" markers.

**Meta post-optimización (Fase 1 debounce):** ≤ 1 recalc por burst de resize, sin long tasks.

## Trace 4 — Theme toggle

1. Grabar 5 s, hacer clic en ThemeToggle una vez, parar.
2. Anotar duración de la transición View Transition API + FPS durante la animación.

**Meta post-optimización:** sin cambios (el view-transition es feature visual deseada, se mantiene).

## Trace 5 — Navegación SPA / → /about → /projects

1. Grabar, clic secuencial en nav items con ~1 s entre cada uno, parar.
2. Anotar TBT por navegación y si partículas mantienen animación (no se reinician; deben seguir corriendo).

**Meta post-optimización (Fase 1):** sin regresión — partículas siguen presentes en todas las rutas (decisión del usuario).

## Archivo de resultados

Guardar los traces exportados (botón "Save profile" en Performance) como:
- `.benchmarks/baseline/trace-hero-desktop.json`
- `.benchmarks/baseline/trace-hero-mobile.json`
- `.benchmarks/baseline/trace-resize.json`
- `.benchmarks/baseline/trace-theme-toggle.json`
- `.benchmarks/baseline/trace-nav.json`

Y llenar la tabla en [baseline-metrics.md](baseline-metrics.md) (se genera tras los Lighthouse).

## Notas

- Estos traces son **opcionales** para fases 2–8 pero **recomendados** antes de Fase 1 (partículas) para poder comparar.
- Si el usuario no tiene tiempo, las métricas de Lighthouse + `build.log` son suficiente baseline para seguir.

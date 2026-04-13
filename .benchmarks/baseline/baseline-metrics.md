# Baseline Metrics — pre-optimización

**Fecha:** 2026-04-12
**Herramientas:** Lighthouse 12 (headless, prod server `pnpm start` en localhost:3000)
**Raw reports:** `*.report.html` / `*.report.json` en esta carpeta.

## Lighthouse Scores (0–100)

| Ruta | Perf | A11y | BP | SEO |
|------|:---:|:---:|:--:|:---:|
| `/` desktop | **95** | 100 | 100 | 100 |
| `/` mobile | **95** | 100 | 96 | 100 |
| `/about` desktop | **100** | 100 | 100 | 100 |
| `/about` mobile | **94** | 100 | 96 | 100 |
| `/projects` desktop | **98** | 100 | 100 | 100 |
| `/projects` mobile | **95** | 100 | 96 | 100 |

## Core Web Vitals

| Ruta | FCP | **LCP** | TBT | CLS | SI |
|------|-----|---------|-----|-----|-----|
| `/` desktop | 0.3 s | 1.3 s | 130 ms | 0 | 0.6 s |
| `/` mobile | 0.9 s | **2.7 s** | 140 ms | 0 | 0.9 s |
| `/about` desktop | 0.3 s | 0.6 s | 0 ms | 0 | 0.8 s |
| `/about` mobile | 0.9 s | 2.5 s | **220 ms** | 0 | 1.5 s |
| `/projects` desktop | 0.3 s | 0.8 s | 100 ms | 0 | 1.0 s |
| `/projects` mobile | 0.9 s | 2.5 s | 170 ms | 0 | 1.3 s |

## Observaciones clave

1. **A11y = 100 en todas las rutas** — el plan de Fase 5 debe mantener este score (no regresiones por ESC handler, aria-live, aria-describedby).
2. **BP = 96 en mobile** (vs 100 desktop) — probablemente por `<img>` warnings. Fase 2 debería llevarlo a 100.
3. **LCP mobile `/` = 2.7 s** — por encima del umbral "Good" (2.5 s). Ganar aquí con Fase 2 (fetchpriority + srcset responsive).
4. **TBT `/about` mobile = 220 ms** — más alto que el resto. Fase 1 (debounce ParticleCanvas) y Fase 3 (content-visibility) deberían reducirlo.
5. **CLS = 0 en todas** — excelente baseline a preservar (no romper con dims de `next/image`).
6. **Perf desktop ≥ 95 en todas** — margen de mejora modesto pero real.

## Bundle (ver [bundle-summary.md](bundle-summary.md))

- Shared chunks: 102 kB
- First Load JS: `/` 172 kB, `/about` 125 kB, `/projects` 169 kB
- 8 warnings `<img>`, 1 warning useMemo missing dep

## Metas post-optimización (Fase 8)

| Métrica | Baseline | Objetivo |
|---------|----------|----------|
| Perf mobile peor caso | 94 | **≥ 97** |
| LCP mobile `/` | 2.7 s | **≤ 2.3 s** |
| TBT mobile peor caso | 220 ms | **≤ 120 ms** |
| BP mobile | 96 | **100** |
| Shared chunks | 102 kB | **≤ 95 kB** |
| First Load `/` | 172 kB | **≤ 160 kB** |
| A11y | 100 | **100 (preservar)** |
| CLS | 0 | **0 (preservar)** |

## Performance traces manuales

Pendientes de captura por el usuario siguiendo [manual-perf-trace.md](manual-perf-trace.md). Opcionales pero recomendados antes de Fase 1 para medir FPS sostenido de ParticleCanvas.

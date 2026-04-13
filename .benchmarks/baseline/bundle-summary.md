# Baseline Bundle Summary — pre-optimización

**Fecha:** 2026-04-12
**Next.js:** 15.5.14
**Build:** `pnpm build` (ver [build.log](build.log))

## First Load JS por ruta

| Ruta | Route-specific | First Load JS (total) |
|------|----------------|-----------------------|
| `/` (home) | 7.78 kB | **172 kB** |
| `/about` | 6.16 kB | **125 kB** |
| `/projects` | 5.11 kB | **169 kB** |
| `/_not-found` | 988 B | 103 kB |
| `/sitemap.xml` | 122 B | 103 kB |
| **Shared base** | — | **102 kB** |

**Chunks compartidos principales:**
- `chunks/79-90f6bfa6c4b0eb94.js` — 45.8 kB
- `chunks/9a4ec5fe-004831ba3127e0f1.js` — 54.2 kB (React + runtime)
- other shared — 2.34 kB

## Warnings del build (confirman hallazgos del plan)

- **8 `<img>` warnings** en: `about/page.jsx:124`, `PygameIcon.jsx:2`, `CertificatesSection.jsx:105`, `ContactSection.jsx:35`, `IntegrationsMarquee.jsx:53`, `ProjectsSection.jsx:56`, `WorkTimeline.jsx:337,350` → confirma **hallazgo #2** (migración a `next/image`, Fase 2).
- **AppContext.jsx:87** — `useMemo missing dependency 'toggleTheme'` → agregar a limpieza en Fase 8.

## Observaciones

- Bundle inicial razonable (102 kB compartidos). `/` y `/projects` cargan ~70 kB adicionales de código route-specific (Spline dynamic import + video player).
- Sin errores. TypeScript/ESLint pasan con warnings.
- Todas las páginas son `○ (Static)` — prerenderizadas correctamente.

## Objetivo post-optimización

- Bundle shared ≤ 95 kB (−7%).
- `/` ≤ 160 kB First Load JS.
- 0 warnings de `<img>` tras Fase 2.

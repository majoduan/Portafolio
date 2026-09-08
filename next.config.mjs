import bundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';

// Activado con ANALYZE=true env var. Genera 3 HTML treemaps en .next/analyze/
// (client, edge, nodejs). Reemplaza el legacy scripts/analyze-bundle.mjs que
// solo sumaba bytes sin distinguir initial vs lazy chunks.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Service Worker generado en build (app/sw.ts -> public/sw.js, ignorado en git).
// Precache acotado: solo el shell (chunks < 700 KB, iconos, manifest, offline).
// El runtime de Spline (2 MB), fuentes decorativas, imágenes y vídeos se cachean
// en runtime al primer uso (reglas en app/sw.ts). Registro manual en
// utils/registerSW.js (toast de "nueva versión") => register: false.
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  register: false,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 700 * 1024,
  // Sin globs con `**`: en Windows generan URLs con backslash (/icons\x.svg) y
  // un 404 en precache impide instalar el SW. El icono se cachea en runtime.
  globPublicPatterns: ['manifest.json', 'offline.html', 'robots.txt'],
  exclude: [/\.map$/, /\.woff2$/, /^_next\/static\/media\//],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'contexts', 'hooks', 'utils', 'data'],
  },
  // Tree-shaking explícito para lucide-react. Sin esto, importar
  // `{ Mail, Linkedin } from 'lucide-react'` puede arrastrar el barrel
  // entero. Cada icono se resuelve a su archivo individual.
  // https://nextjs.org/docs/app/api-reference/next-config-js/modularizeImports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  // NOTA @splinetool/runtime: se queda en 1.12.x. La 2.x (probada 2.0.41,
  // 2026-09-08) rompe el build con webpack — construye URLs de WASM/Draco con
  // `new URL('x.wasm', import.meta.url)` hacia archivos que no existen en el
  // paquete (los sirve cdn.spline.design / gstatic en runtime) — y además exige
  // abrir la CSP a esos hosts. Reintentar solo con Turbopack (Next 16) y CSP
  // revisada (plan §2.7 / §5.3).

  // Única fuente de cabeceras HTTP. (vercel.json duplicaba este bloque y Vercel
  // enviaba cada cabecera dos veces; se eliminó.)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP Note: 'unsafe-inline' lo exige el script inline de tema/idioma
            // del <head> (sin nonce: las páginas son estáticas). 'wasm-unsafe-eval'
            // cubre el WASM del runtime de Spline (physics/compresión) sin abrir
            // eval() de JS (antes 'unsafe-eval'). Verificado: la escena carga sin
            // violaciones de CSP con esta política.
            // Risk mitigated by: no user-generated content, no API routes, static deployment.
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://prod.spline.design; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://prod.spline.design; font-src 'self' data:; connect-src 'self' https://prod.spline.design wss://prod.spline.design; media-src 'self' blob:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          // X-XSS-Protection eliminado: obsoleto (ningún navegador moderno lo
          // usa) y en navegadores antiguos el filtro introducía vulnerabilidades.
          // La protección real es la CSP.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/media/projects/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/docs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
          { key: 'Content-Type', value: 'application/pdf' },
          { key: 'Content-Disposition', value: 'inline; filename="Mateo_Duenas_CV.pdf"' },
        ],
      },
    ];
  },
};

export default withSerwist(withBundleAnalyzer(nextConfig));

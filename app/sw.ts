/// <reference lib="webworker" />
// Service Worker (Serwist). Sustituye al sw.js manual (v2.7.0).
//
// Por qué Serwist: el manifiesto de precache se genera del build real, así que
// HTML y chunks son siempre del MISMO deploy (el sw.js manual hacía
// networkFirst con timeout de 3 s y podía servir un HTML en caché que
// referenciaba chunks de otro build). Versionado automático por build.
//
// Qué se precachea: shell mínimo (iconos, manifest, offline.html, chunks JS/CSS
// < 700 KB). NO se precachean el runtime de Spline (2 MB), las fuentes
// decorativas, imágenes ni vídeos: se cachean en runtime al primer uso.

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, RangeRequestsPlugin, Serwist, StaleWhileRevalidate } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Escena Spline (CloudFront, sin Cache-Control): sirve caché al instante y
    // revalida en segundo plano => 2ª visita sin descarga de 2 MB.
    {
      matcher: ({ url }) => url.hostname === 'prod.spline.design',
      handler: new StaleWhileRevalidate({
        cacheName: 'spline-scene',
        plugins: [new ExpirationPlugin({ maxEntries: 2, maxAgeSeconds: 14 * DAY })],
      }),
    },
    // Vídeos de proyectos: cache-first con soporte de Range (el navegador pide
    // fragmentos). Solo se cachea lo que el usuario reproduce.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/media/projects/videos/'),
      handler: new CacheFirst({
        cacheName: 'project-videos',
        plugins: [
          new RangeRequestsPlugin(),
          new ExpirationPlugin({ maxEntries: 24, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true }),
        ],
      }),
    },
    // Imágenes propias (AVIF/SVG): inmutables por nombre (-400w, -800w...).
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && (url.pathname.startsWith('/media/') || url.pathname.startsWith('/icons/')),
      handler: new CacheFirst({
        cacheName: 'media-images',
        plugins: [new ExpirationPlugin({ maxEntries: 160, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true })],
      }),
    },
    // CV (PDF): stale-while-revalidate para que una actualización se propague.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/docs/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'documents',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 30 * DAY })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Service Worker para Portfolio - Cache Strategy OPTIMIZADO
// Version 2.4.0 - Enhanced Video Caching + Adaptive Quality

const CACHE_VERSION = '2.4.0';
const CACHE_NAME = `mateo-portfolio-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-v${CACHE_VERSION}`;
const IMAGE_CACHE = `images-cache-v${CACHE_VERSION}`;
const VIDEO_CACHE = `videos-cache-v${CACHE_VERSION}`;
const VIDEO_MOBILE_CACHE = `videos-mobile-cache-v${CACHE_VERSION}`;

// Assets críticos para cachear inmediatamente - OPTIMIZADO
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/images/foto-perfil.webp'
  // Certificados se cargan bajo demanda con stale-while-revalidate
];

// Instalar Service Worker y pre-cachear assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name !== CACHE_NAME && 
            name !== RUNTIME_CACHE && 
            name !== IMAGE_CACHE && 
            name !== VIDEO_CACHE &&
            name !== VIDEO_MOBILE_CACHE // v2.4: Nueva cache para videos mobile
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Tomar control inmediatamente
  return self.clients.claim();
});

// Estrategia de cache: Network First para HTML, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests no-GET y externos (excepto Spline)
  if (request.method !== 'GET' || 
      (!url.origin.includes(self.location.origin) && !url.origin.includes('spline.design'))) {
    return;
  }

  // Estrategia según tipo de recurso - OPTIMIZADO v2.4
  if (request.destination === 'document') {
    // HTML: Network First (siempre intentar red primero)
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  } else if (request.url.includes('/videos/')) {
    // Videos: Cache on-demand con separación mobile/desktop
    // NUEVO: No pre-cachear, solo cachear después de primera visualización
    const isMobile = request.url.includes('-mobile.mp4');
    const cacheName = isMobile ? VIDEO_MOBILE_CACHE : VIDEO_CACHE;
    event.respondWith(cacheOnDemand(request, cacheName, 30 * 24 * 60 * 60 * 1000)); // 30 días
  } else if (request.url.includes('/images/')) {
    // Imágenes: Stale While Revalidate con cache dedicado
    event.respondWith(staleWhileRevalidateWithCache(request, IMAGE_CACHE));
  } else if (request.url.includes('.js') || request.url.includes('.css')) {
    // JS/CSS: Stale While Revalidate (mejor UX)
    event.respondWith(staleWhileRevalidateWithCache(request, RUNTIME_CACHE));
  } else if (request.url.includes('spline.design')) {
    // Escena Spline: Cache First con larga expiración
    event.respondWith(cacheFirstWithExpiry(request, RUNTIME_CACHE, 7 * 24 * 60 * 60 * 1000)); // 7 días
  } else {
    // Otros: Network First con fallback a cache
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  }
});

// Network First: Intentar red primero, fallback a cache
async function networkFirst(request, cacheName = RUNTIME_CACHE) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    // Fallback para HTML
    if (request.destination === 'document') {
      return new Response(
        '<html><body><h1>Sin conexión</h1><p>Por favor, verifica tu conexión a internet.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    throw error;
  }
}

// Cache First con expiración: Servir de cache, actualizar en background
async function cacheFirstWithExpiry(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Si está en cache y no ha expirado, servir de cache
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now - cachedDate;

    if (age < maxAge) {
      console.log('[SW] Serving from cache:', request.url);
      // Actualizar en background solo si está cerca de expirar (80% del maxAge)
      if (age > maxAge * 0.8) {
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
        }).catch(() => {});
      }
      return cachedResponse;
    }
  }

  // No está en cache o expiró, intentar red
  try {
    const networkResponse = await fetch(request);
    // Solo cachear respuestas completas (no parciales como 206)
    if (networkResponse.ok && networkResponse.status !== 206) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Si falla la red, servir cache aunque haya expirado
    if (cachedResponse) {
      console.log('[SW] Network failed, serving stale cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate: Servir cache inmediatamente, actualizar en background
async function staleWhileRevalidateWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request).then((networkResponse) => {
    // Solo cachear respuestas completas (no parciales como 206)
    if (networkResponse.ok && networkResponse.status !== 206) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  // Retornar cache inmediatamente si existe, sino esperar a red
  return cachedResponse || networkPromise;
}

// NUEVO v2.4: Cache on Demand para videos
// Solo cachea después de que el usuario vea el video por primera vez
async function cacheOnDemand(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Si está en cache y no ha expirado, servir inmediatamente
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now - cachedDate;

    if (age < maxAge) {
      console.log('[SW] Video desde cache:', request.url);
      return cachedResponse;
    } else {
      console.log('[SW] Video expirado, descargando nuevo:', request.url);
    }
  }

  // No está en cache o expiró, descargar de red
  try {
    const networkResponse = await fetch(request);
    
    // Cachear solo si es respuesta completa (200) o parcial (206)
    if (networkResponse.ok) {
      // Para videos, siempre intentar cachear la respuesta completa
      if (networkResponse.status === 200) {
        console.log('[SW] Cacheando video completo:', request.url);
        cache.put(request, networkResponse.clone());
      } else if (networkResponse.status === 206) {
        console.log('[SW] Respuesta parcial (206), no cachear:', request.url);
        // No cachear respuestas parciales, causaría problemas
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Si falla red y hay cache (aunque expirado), servirlo
    if (cachedResponse) {
      console.log('[SW] Red falló, sirviendo cache expirado:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Mensaje desde la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});

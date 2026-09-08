'use client';
/**
 * Precarga de recursos below-the-fold.
 *
 * Se ejecuta cuando el boot screen ha terminado y el hilo principal está
 * ocioso (requestIdleCallback), NUNCA durante el boot: antes corría a los 3 s
 * del arranque y sus `import()` + prefetch competían con la compilación del
 * runtime de Spline y con la descarga de la escena.
 *
 * Ya no precarga vídeos: 6 prefetch de mp4 completos costaban 5,8 MB por visita
 * a la home sin interacción del usuario y competían con la escena 3D por ancho
 * de banda. El Service Worker cachea cada vídeo bajo demanda en su primer play.
 */
const POSTERS = [
  '/media/projects/posters/crumb-coach-poster.avif',
  '/media/projects/posters/connect-invest-marketing-poster.avif',
  '/media/projects/posters/daily-abide-poster.avif',
  '/media/projects/posters/poa-management-poster.avif',
  '/media/projects/posters/epn-certificates-poster.avif',
  '/media/projects/posters/travel-allowance-poster.avif',
];

const CERTIFICATES = [
  '/media/certificates/epn-award-800w.avif',
  '/media/certificates/cisco-networking-800w.avif',
  '/media/certificates/digital-transformation-800w.avif',
  '/media/certificates/scrum-foundation-800w.avif',
];

const prefetchImage = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = href;
  document.head.appendChild(link);
};

export const preloadCriticalResources = () => {
  // Chunks de las secciones lazy (descarga + compilación en idle)
  import('../components/sections/ProjectsSection').catch(() => {});
  import('../components/sections/ContactSection').catch(() => {});

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(connection && connection.saveData);
  if (saveData) return; // respetar "ahorro de datos": sin prefetch de imágenes

  CERTIFICATES.forEach(prefetchImage);
  POSTERS.forEach(prefetchImage);
};

/**
 * Programa la precarga para cuando el navegador esté ocioso. Devuelve una
 * función de cancelación.
 */
export const schedulePreload = () => {
  if (typeof window === 'undefined') return () => {};
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(() => preloadCriticalResources(), { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(preloadCriticalResources, 1500);
  return () => clearTimeout(id);
};

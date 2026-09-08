'use client';
/**
 * Utilidades para servir videos con calidad adaptativa
 * Basado en device capabilities y velocidad de conexión
 *
 * IMPORTANTE: Requiere generar versiones mobile de los videos con FFmpeg:
 * ffmpeg -i input.mp4 -vf scale=-2:480 -c:v libx264 -crf 28 -preset fast output-mobile.mp4
 *
 * SSR-safe: todas las funciones que consultan el dispositivo devuelven el valor
 * "desktop" en el servidor. Los componentes eligen la fuente en un efecto (no
 * en render) para no producir mismatch de hidratación.
 */

const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

/**
 * Detecta si el dispositivo debe recibir versión mobile (480p) o desktop (720p)
 *
 * @returns {boolean} true si debe usar versión mobile
 */
export const shouldUseMobileVideo = () => {
  if (!isBrowser()) return false;

  // 1. Detectar dispositivo móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // 2. Detectar pantalla pequeña (incluso si no es mobile user agent)
  const isSmallScreen = window.innerWidth < 768;

  // 3. Detectar conexión lenta
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = !!connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );

  // 4. Detectar modo ahorro de datos
  const saveData = connection?.saveData === true;

  return isMobile || isSmallScreen || isSlowConnection || saveData;
};

/**
 * Obtiene la mejor fuente de video según device capabilities.
 *
 * @param {string} videoPath - Ruta original del video (ej: '/media/projects/videos/project.mp4')
 * @param {object} [opts]
 * @param {number} [opts.displayWidthPx] - Ancho renderizado del reproductor × devicePixelRatio.
 *   Si el elemento no puede mostrar más de ~960 px físicos, la versión 480p es
 *   visualmente equivalente y pesa la mitad (Fase 3.1 del plan).
 * @returns {string} Ruta optimizada del video
 */
export const getOptimalVideoSource = (videoPath, opts = {}) => {
  const byDevice = shouldUseMobileVideo();
  const byDisplay = typeof opts.displayWidthPx === 'number' && opts.displayWidthPx > 0 && opts.displayWidthPx <= 960;
  if (byDevice || byDisplay) {
    return videoPath.replace('.mp4', '-mobile.mp4');
  }
  return videoPath;
};

/**
 * Obtiene el poster optimizado según device
 *
 * @param {string} videoPath - Ruta del video
 * @returns {string} Ruta del poster optimizado
 */
export const getOptimalPoster = (videoPath) => {
  // Posters viven en /media/projects/posters/ (videos en /media/projects/videos/)
  return videoPath
    .replace('/videos/', '/posters/')
    .replace('.mp4', '-poster.avif');
};

/**
 * Precarga un video con la calidad apropiada
 *
 * @param {string} videoPath - Ruta del video
 * @returns {HTMLVideoElement|null} Elemento video precargado
 */
export const preloadOptimalVideo = (videoPath) => {
  if (!isBrowser()) return null;
  const optimalSrc = getOptimalVideoSource(videoPath);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.src = optimalSrc;
  video.muted = true;
  return video;
};

/**
 * Estima el tamaño de descarga según la calidad
 *
 * @param {string} videoPath - Ruta del video
 * @param {number} durationSeconds - Duración del video en segundos
 * @returns {object} Información de tamaño estimado
 */
export const estimateVideoSize = (videoPath, durationSeconds = 30) => {
  const useMobile = shouldUseMobileVideo();
  // 720p: ~2.5 Mbps, 480p: ~1 Mbps
  const bitrateMbps = useMobile ? 1 : 2.5;
  const sizeMB = (bitrateMbps * durationSeconds) / 8;
  return {
    quality: useMobile ? '480p' : '720p',
    estimatedSizeMB: Math.round(sizeMB * 10) / 10,
    bitrateMbps
  };
};

export default {
  shouldUseMobileVideo,
  getOptimalVideoSource,
  getOptimalPoster,
  preloadOptimalVideo,
  estimateVideoSize
};

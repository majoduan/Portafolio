/**
 * Utilidades para servir videos con calidad adaptativa
 * Basado en device capabilities y velocidad de conexión
 * 
 * IMPORTANTE: Requiere generar versiones mobile de los videos con FFmpeg:
 * ffmpeg -i input.mp4 -vf scale=-2:480 -c:v libx264 -crf 28 -preset fast output-mobile.mp4
 */

/**
 * Detecta si el dispositivo debe recibir versión mobile (480p) o desktop (720p)
 * 
 * @returns {boolean} true si debe usar versión mobile
 */
export const shouldUseMobileVideo = () => {
  // 1. Detectar dispositivo móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // 2. Detectar pantalla pequeña (incluso si no es mobile user agent)
  const isSmallScreen = window.innerWidth < 768;
  
  // 3. Detectar conexión lenta
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );
  
  // 4. Detectar modo ahorro de datos
  const saveData = connection?.saveData === true;
  
  // Usar mobile si: es móvil OR pantalla pequeña OR conexión lenta OR ahorro de datos
  const useMobile = isMobile || isSmallScreen || isSlowConnection || saveData;
  
  return useMobile;
};

/**
 * Obtiene la mejor fuente de video según device capabilities
 * 
 * @param {string} videoPath - Ruta original del video (ej: '/videos/project.mp4')
 * @returns {string} Ruta optimizada del video
 */
export const getOptimalVideoSource = (videoPath) => {
  const useMobile = shouldUseMobileVideo();
  
  if (useMobile) {
    // Servir versión mobile (480p)
    const mobilePath = videoPath.replace('.mp4', '-mobile.mp4');
    return mobilePath;
  }
  
  // Desktop: versión original (720p)
  return videoPath;
};

/**
 * Obtiene el poster optimizado según device
 * 
 * @param {string} videoPath - Ruta del video
 * @returns {string} Ruta del poster optimizado
 */
export const getOptimalPoster = (videoPath) => {
  // Poster siempre es webp (ya optimizado)
  return videoPath.replace('.mp4', '-poster.webp');
};

/**
 * Precarga un video con la calidad apropiada
 * Útil para preload anticipado
 * 
 * @param {string} videoPath - Ruta del video
 * @returns {HTMLVideoElement} Elemento video precargado
 */
export const preloadOptimalVideo = (videoPath) => {
  const optimalSrc = getOptimalVideoSource(videoPath);
  const video = document.createElement('video');
  
  video.preload = 'metadata';
  video.src = optimalSrc;
  video.muted = true;
  
  return video;
};

/**
 * Estima el tamaño de descarga según la calidad
 * Útil para mostrar advertencias en conexiones lentas
 * 
 * @param {string} videoPath - Ruta del video
 * @param {number} durationSeconds - Duración del video en segundos
 * @returns {object} Información de tamaño estimado
 */
export const estimateVideoSize = (videoPath, durationSeconds = 30) => {
  const useMobile = shouldUseMobileVideo();
  
  // Estimaciones aproximadas basadas en bitrate típico
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

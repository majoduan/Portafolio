/**
 * Utilidades para gestión de cache de videos
 * Basado en el modelo de YouTube para liberar memoria agresivamente
 * v2.4: Modo agresivo inteligente basado en device capabilities
 */

// Map para guardar estado de videos antes de limpiar cache
const videoCacheState = new Map();

/**
 * Detectar si se debe usar modo agresivo de limpieza
 * Móvil o dispositivos con poca RAM usan modo agresivo (borra src)
 * Desktop con buena RAM usa modo soft (solo pausa)
 * 
 * @returns {boolean} true si debe usar modo agresivo
 */
export const shouldUseAggressiveCache = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Detectar RAM disponible (API experimental, no todos los navegadores)
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  
  // Detectar conexión lenta (video re-download será costoso)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g'
  );
  
  // Modo agresivo: móvil OR poca RAM OR (conexión lenta AND poca RAM)
  const aggressive = isMobile || isLowMemory || (isSlowConnection && isLowMemory);
  
  console.log(`[VideoCache] 🔍 Device analysis:`, {
    isMobile,
    isLowMemory,
    isSlowConnection,
    aggressiveMode: aggressive
  });
  
  return aggressive;
};

/**
 * Limpia el cache de todos los videos en la página
 * 
 * MODO AGRESIVO (móvil/low RAM): Pausa + borra src para liberar memoria
 * MODO SOFT (desktop): Solo pausa, mantiene src en browser cache
 * 
 * @param {string} excludeSelector - Selector CSS opcional para excluir videos (ej: videos del modal)
 * @param {boolean} aggressive - Forzar modo agresivo (null = auto-detect)
 */
export const clearAllVideoCache = (excludeSelector = null, aggressive = null) => {
  // Auto-detectar modo si no se especifica
  const useAggressiveMode = aggressive !== null ? aggressive : shouldUseAggressiveCache();
  
  const allVideos = document.querySelectorAll('video');
  let clearedCount = 0;

  allVideos.forEach((video, index) => {
    // Si hay un selector de exclusión, verificar si el video debe ser excluido
    if (excludeSelector && video.closest(excludeSelector)) {
      console.log('[VideoCache] ⏭️ Video excluido de limpieza');
      return;
    }

    // Guardar estado antes de modificar
    videoCacheState.set(index, {
      src: video.src,
      currentTime: video.currentTime,
      paused: video.paused,
      wasCleared: useAggressiveMode
    });

    // 1. Pausar video (ambos modos)
    video.pause();

    // 2. Resetear tiempo a 0 (ambos modos)
    video.currentTime = 0;

    if (useAggressiveMode) {
      // MODO AGRESIVO: Remover src para liberar memoria del buffer
      const originalSrc = video.src;
      video.removeAttribute('src');
      video.load(); // Forzar limpieza del buffer

      // Guardar src original como data-attribute
      if (originalSrc) {
        video.setAttribute('data-original-src', originalSrc);
      }
    }
    // MODO SOFT: Solo pausado, el video sigue en browser cache

    clearedCount++;
  });

  const mode = useAggressiveMode ? 'agresivo' : 'soft';
  console.log(`[VideoCache] 🧹 Cache limpiado (${mode}): ${clearedCount} videos pausados`);
  
  // Sugerir al navegador que libere memoria (solo en modo agresivo)
  if (useAggressiveMode && window.gc) {
    window.gc(); // Solo disponible en Chrome con --js-flags="--expose-gc"
  }

  return clearedCount;
};

/**
 * Restaura los videos que fueron limpiados del cache
 * 
 * MODO AGRESIVO: Restaura src desde data-attribute
 * MODO SOFT: No hace nada (videos ya tienen src)
 * 
 * @param {string} selector - Selector CSS opcional para restaurar solo ciertos videos
 */
export const restoreVideoCache = (selector = 'video') => {
  const videosToRestore = document.querySelectorAll(selector);
  let restoredCount = 0;
  let skippedCount = 0;

  videosToRestore.forEach((video, index) => {
    const cachedState = videoCacheState.get(index);
    
    // Si el video fue limpiado en modo agresivo, restaurar src
    if (cachedState?.wasCleared) {
      const originalSrc = video.getAttribute('data-original-src') || cachedState.src;
      
      if (originalSrc && !video.src) {
        video.src = originalSrc;
        video.removeAttribute('data-original-src');
        video.load(); // Recargar video
        restoredCount++;
      }
    } else {
      // Modo soft: video ya tiene src, no hacer nada
      skippedCount++;
    }
  });

  console.log(`[VideoCache] ♻️ Cache restaurado: ${restoredCount} videos recargados, ${skippedCount} ya en cache`);
  
  // Limpiar estado guardado
  videoCacheState.clear();
  
  return restoredCount;
};

/**
 * Pausa selectivamente videos que NO están en el viewport
 * Útil para optimización continua mientras el usuario navega
 * 
 * @param {number} threshold - Porcentaje de visibilidad requerido (0.0 - 1.0)
 */
export const pauseOffscreenVideos = (threshold = 0.3) => {
  const allVideos = document.querySelectorAll('video');
  let pausedCount = 0;

  allVideos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calcular porcentaje visible
    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const videoHeight = rect.height;
    const visibilityRatio = visibleHeight / videoHeight;

    // Si está menos visible que el threshold, pausar
    if (visibilityRatio < threshold && !video.paused) {
      video.pause();
      pausedCount++;
    }
  });

  if (pausedCount > 0) {
    console.log(`[VideoCache] 🎬 Videos fuera de pantalla pausados: ${pausedCount}`);
  }

  return pausedCount;
};

/**
 * Obtiene estadísticas de memoria de videos
 * Útil para debugging y monitoreo
 */
export const getVideoMemoryStats = () => {
  const allVideos = document.querySelectorAll('video');
  let totalBuffered = 0;
  let activeVideos = 0;

  allVideos.forEach((video) => {
    // Contar videos activos (con src cargado)
    if (video.src && video.readyState >= 2) {
      activeVideos++;
      
      // Estimar memoria buffered (aproximado)
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 0;
        const bufferRatio = bufferedEnd / duration;
        
        // Estimar ~1MB por segundo de video (muy aproximado)
        totalBuffered += bufferedEnd;
      }
    }
  });

  const stats = {
    totalVideos: allVideos.length,
    activeVideos,
    inactiveVideos: allVideos.length - activeVideos,
    estimatedBufferedSeconds: Math.round(totalBuffered),
    estimatedMemoryMB: Math.round(totalBuffered * 1) // ~1MB/s
  };

  console.table(stats);
  return stats;
};

export default {
  clearAllVideoCache,
  restoreVideoCache,
  pauseOffscreenVideos,
  getVideoMemoryStats
};

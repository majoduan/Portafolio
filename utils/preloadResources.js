'use client';
/**
 * Precarga inteligente de recursos críticos
 * Se ejecuta DURANTE el boot screen (3s delay) para aprovechar el tiempo muerto
 * OPTIMIZADO: Adaptativo según dispositivo y velocidad de conexión
 */
export const preloadCriticalResources = () => {
  // Prefetch below-fold component chunks (download without executing)
  import('../components/sections/ProjectsSection').catch(() => {});
  import('../components/sections/ContactSection').catch(() => {});
  // Debug mode - cambiar a true para ver logs detallados
  const DEBUG = false;
  
  // Detectar móvil y conexión
  const isMobile = window.innerWidth < 768;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlow = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g' ||
    connection.saveData === true  // Usuario activó "ahorro de datos"
  );

  // NIVEL 1: CRÍTICO - Imágenes de certificados optimizadas AVIF (siempre precargar, son ligeras)
  const certificateImages = [
    '/images/optimized/epn-award-800w.avif',
    '/images/optimized/cisco-networking-800w.avif',
    '/images/optimized/digital-transformation-800w.avif',
    '/images/optimized/scrum-foundation-800w.avif'
  ];

  certificateImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // NIVEL 2: Posters de videos (ligeros, útiles para móvil)
  const posters = [
    '/videos/poa-management-poster.avif',
    '/videos/epn-certificates-poster.avif',
    '/videos/travel-allowance-poster.avif',
    '/videos/storycraft-poster.avif',
    '/videos/fitness-tracker-poster.avif',
    '/videos/space-invaders-poster.avif',
    '/videos/godot-game-2d-poster.avif',
    '/videos/godot-game-3d-poster.avif'
  ];

  posters.forEach(posterSrc => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = posterSrc;
    document.head.appendChild(link);
  });

  // NIVEL 3: Videos - SOLO en desktop con conexión rápida
  if (!isMobile && !isSlow) {
    if (DEBUG) console.log('[Preload] 🎬 Preloading videos (desktop + fast connection)');
    
    // 2A. Videos prioritarios - metadata only
    const priorityVideos = [
      '/videos/poa-management.mp4',
      '/videos/epn-certificates.mp4'
    ];

    priorityVideos.forEach(videoSrc => {
      const video = document.createElement('video');
      video.preload = 'metadata';  // Solo metadata, no todo el video
      video.src = videoSrc;
      video.muted = true;
    });

    // 2B. Resto de videos - prefetch después de 5s (no 3s)
    setTimeout(() => {
      const remainingVideos = [
        '/videos/travel-allowance.mp4',
        '/videos/storycraft.mp4',
        '/videos/fitness-tracker.mp4',
        '/videos/space-invaders.mp4',
        '/videos/godot-game-2d.mp4',
        '/videos/godot-game-3d.mp4'
      ];

      if (DEBUG && remainingVideos.length > 0) {
        console.log(`[Preload] ⏳ Prefetching ${remainingVideos.length} remaining videos...`);
      }

      remainingVideos.forEach(videoSrc => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'video';
        link.href = videoSrc;
        document.head.appendChild(link);
      });
    }, 5000);
  }
};

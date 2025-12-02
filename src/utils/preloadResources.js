/**
 * Precarga inteligente de recursos críticos
 * Se ejecuta DESPUÉS del boot screen para evitar referencias circulares
 * OPTIMIZADO: Adaptativo según dispositivo y velocidad de conexión
 */
export const preloadCriticalResources = () => {
  // Detectar móvil y conexión
  const isMobile = window.innerWidth < 768;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlow = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g' ||
    connection.saveData === true  // Usuario activó "ahorro de datos"
  );

  console.log('[Preload] 📱 Device:', isMobile ? 'Mobile' : 'Desktop');
  console.log('[Preload] 🌐 Connection:', connection?.effectiveType || 'unknown');
  if (isSlow) console.log('[Preload] ⚠️ Slow connection detected');

  // NIVEL 1: CRÍTICO - Imágenes de certificados (siempre precargar, son ligeras)
  const certificateImages = [
    '/images/certificates/epn-award.webp',
    '/images/certificates/cisco-networking.webp',
    '/images/certificates/digital-transformation.webp',
    '/images/certificates/scrum-foundation.webp'
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
    '/videos/poa-management-poster.webp',
    '/videos/epn-certificates-poster.webp',
    '/videos/travel-allowance-poster.webp',
    '/videos/storycraft-poster.webp',
    '/videos/fitness-tracker-poster.webp',
    '/videos/space-invaders-poster.webp',
    '/videos/godot-game-2d-poster.webp',
    '/videos/godot-game-3d-poster.webp'
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
    console.log('[Preload] 🎬 Preloading videos (desktop + fast connection)');
    
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

      remainingVideos.forEach(videoSrc => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'video';
        link.href = videoSrc;
        document.head.appendChild(link);
      });
      
      console.log('[Preload] ✅ Remaining videos prefetched');
    }, 5000);
  } else {
    console.log('[Preload] 🚫 Skipping video preload (mobile or slow connection)');
    console.log('[Preload] 📹 Videos will load on-demand when visible in viewport');
  }
};

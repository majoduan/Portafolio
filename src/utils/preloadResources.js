/**
 * Precarga inteligente de recursos críticos
 * Se ejecuta DESPUÉS del boot screen para evitar referencias circulares
 */
export const preloadCriticalResources = () => {
  // 1. PRIORIDAD ALTA: Precargar imágenes de certificados
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

  // 2. PRIORIDAD MEDIA: Precargar metadata de videos prioritarios
  const priorityVideos = [
    '/videos/poa-management.mp4',
    '/videos/epn-certificates.mp4'
  ];

  priorityVideos.forEach(videoSrc => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoSrc;
    video.muted = true;
  });

  // 3. PRIORIDAD BAJA: Prefetch de videos restantes después de 3s
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
  }, 3000);
};

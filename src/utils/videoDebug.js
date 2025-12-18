/**
 * Utilidades de debugging para videos
 * Usar en DevTools console para diagnosticar problemas
 */

export const debugAllVideos = () => {
  const videos = document.querySelectorAll('video');
  console.log(`Total videos en página: ${videos.length}`);
  
  videos.forEach((video, index) => {
    console.log(`\n[Video ${index + 1}]`, {
      src: video.src,
      paused: video.paused,
      autoplay: video.autoplay,
      muted: video.muted,
      readyState: video.readyState,
      currentTime: video.currentTime,
      duration: video.duration
    });
  });
};

export const forcePlayAllVideos = () => {
  const videos = document.querySelectorAll('video');
  videos.forEach((video, index) => {
    video.muted = true; // Asegurar muted
    video.play()
      .then(() => console.log(`Video ${index + 1} reproduciendo ✅`))
      .catch(err => console.error(`Video ${index + 1} error:`, err));
  });
};

// Exponer globalmente en window para usar en console
if (typeof window !== 'undefined') {
  window.debugAllVideos = debugAllVideos;
  window.forcePlayAllVideos = forcePlayAllVideos;
}

export default {
  debugAllVideos,
  forcePlayAllVideos
};

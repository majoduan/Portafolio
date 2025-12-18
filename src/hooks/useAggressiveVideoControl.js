/**
 * Hook para control agresivo de videos con optimizaciones estilo YouTube
 * 
 * Características:
 * - Threshold 50%: Pausa cuando MENOS del 50% está visible
 * - Móvil: Pausa automáticamente a los 10 segundos
 * - Desktop: Pausa cuando sale del viewport
 * - Compatible con sistema de pausa global (modales)
 * - NO controla reproducción inicial (autoPlay del elemento lo maneja)
 * 
 * @param {React.RefObject} videoRef - Referencia al contenedor del video
 * @param {boolean} shouldPauseVideo - Pausa forzada (modal abierto)
 */

import { useEffect } from 'react';

export const useAggressiveVideoControl = (videoRef, shouldPauseVideo = false) => {
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current.querySelector('video');
    if (!video) return;

    // === PRIORIDAD 1: Pausa global (modal abierto) ===
    if (shouldPauseVideo) {
      video.pause();
      return;
    }

    // === PRIORIDAD 2: Intersection Observer - SOLO PAUSAR cuando sale ===
    // El autoPlay del elemento <video> maneja la reproducción inicial
    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersectionRatio = entry.intersectionRatio;

        if (intersectionRatio < 0.4) {
          // Menos del 10% visible - pausar
          if (!video.paused) {
            video.pause();
          }
        } else {
          // Más del 10% visible - reproducir
          if (video.paused && !timeLimitReached) {
            video.play().catch(() => {});
          }
        }
      },
      {
        // Usar threshold array para detectar cambios granulares
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '0px'
      }
    );

    // === PRIORIDAD 3: Límite de 10s en móvil ===
    let timeLimitReached = false;

    const handleTimeUpdate = () => {
      if (isMobile && !timeLimitReached && video.currentTime >= 10) {
        video.pause();
        timeLimitReached = true;
      }
    };

    // === PRIORIDAD 4: Reset cuando el video vuelve a loop ===
    const handleLoop = () => {
      if (isMobile) {
        timeLimitReached = false;
      }
    };

    // Agregar listeners
    if (isMobile) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('seeked', handleLoop);
    }

    // Observar el contenedor del video
    observer.observe(videoRef.current);

    // Cleanup
    return () => {
      observer.disconnect();
      if (isMobile) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('seeked', handleLoop);
      }
    };
  }, [videoRef, isMobile, shouldPauseVideo]);

  // Hook no devuelve nada - solo side effects (pausa)
};

export default useAggressiveVideoControl;

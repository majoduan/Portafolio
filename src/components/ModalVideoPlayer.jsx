import { useState, useRef, useEffect } from 'react';
import { getOptimalVideoSource, getOptimalPoster } from '../utils/adaptiveVideo';
import { trackVideoError, trackVideoEvent } from '../utils/telemetry';

/**
 * Componente para reproducir videos en el modal
 * Lazy-loaded para no bloquear la apertura del modal
 * 
 * Características:
 * - Adaptive quality (480p mobile, 720p desktop)
 * - Lazy loading del video hasta que esté visible
 * - Loading indicator mientras carga
 * - Error handling
 */
const ModalVideoPlayer = ({ src, alt, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);
  
  const optimalSrc = getOptimalVideoSource(src);
  const posterSrc = getOptimalPoster(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      // Trackear carga exitosa
      trackVideoEvent('loaded', optimalSrc);
      
      // Intentar reproducir automáticamente
      video.play().catch((error) => {
        console.warn('[ModalVideo] Autoplay bloqueado:', error);
        // No mostrar error, es comportamiento normal del browser
      });
    };

    const handleError = (error) => {
      console.error('[ModalVideo] Error cargando video:', error);
      setHasError(true);
      setIsLoading(false);
      
      // Trackear error para telemetría
      trackVideoError(optimalSrc, error.target?.error || error, {
        component: 'ModalVideoPlayer',
        alt
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Cargando video...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center p-6">
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
              Error al cargar el video
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Por favor, intenta recargar la página
            </p>
          </div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        controls
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={posterSrc}
        className={`w-full h-full object-contain rounded-2xl transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ 
          maxHeight: '70vh',
          backgroundColor: 'rgba(15, 23, 42, 0.5)' 
        }}
      >
        <source src={optimalSrc} type="video/mp4" />
        Tu navegador no soporta el elemento video.
      </video>
    </div>
  );
};

export default ModalVideoPlayer;

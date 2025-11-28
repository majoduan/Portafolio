import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './HUDBootScreen.css';
import { 
  HardDrive, 
  Zap, 
  Mail, 
  Calendar,
  Sun,
  Moon,
  Droplets,
  Wind,
  Power,
  RotateCw
} from 'lucide-react';

// Cache global para módulo de Spline precargado
let splineModuleCache = null;

// Precarga inteligente de recursos críticos con estrategia de prioridad y caché
const preloadResources = async () => {
  // 1. PRIORIDAD ALTA: Precargar y cachear módulo de Spline
  if (!splineModuleCache) {
    splineModuleCache = import('@splinetool/react-spline')
      .then(module => {
        console.log('✅ Módulo Spline precargado y cacheado');
        return module;
      })
      .catch(err => {
        console.warn('⚠️ Spline preload failed, will load on demand:', err);
        return null;
      });
  }

  // 2. PRIORIDAD ALTA: Precargar imágenes de certificados
  const certificateImages = [
    '/images/certificates/epn-award.jpg',
    '/images/certificates/cisco-networking.jpg',
    '/images/certificates/digital-transformation.jpg',
    '/images/certificates/scrum-foundation.jpg'
  ];

  certificateImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // 3. PRIORIDAD MEDIA: Precargar solo METADATA de videos prioritarios
  // Esto carga solo los primeros frames, no el video completo (~100KB vs 2MB)
  const priorityVideos = [
    '/videos/poa-management.mp4',
    '/videos/epn-certificates.mp4'
  ];

  priorityVideos.forEach(videoSrc => {
    const video = document.createElement('video');
    video.preload = 'metadata'; // Solo metadata, no video completo
    video.src = videoSrc;
    video.muted = true;
  });

  // 4. PRIORIDAD BAJA: Prefetch ligero de videos restantes después de 5 segundos
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
  }, 5000); // Aumentado a 5s para dar prioridad a recursos críticos
};

const HUDBootScreen = React.memo(({ onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [typewriterText, setTypewriterText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [systemProgress, setSystemProgress] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in', 'visible', 'fade-out'
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  
  const initText = useMemo(() => "> INITIALIZING SYSTEM...", []);

  // Actualizar reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Efecto typewriter para texto central
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= initText.length) {
        setTypewriterText(initText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Cursor parpadeante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Fade-in inicial + Precarga de recursos
  useEffect(() => {
    // Iniciar precarga de recursos en paralelo
    preloadResources();
    
    // Empezar el fade-in inmediatamente
    const fadeTimer = setTimeout(() => {
      setFadeState('visible');
    }, 2000); // Duración del fade-in
    
    return () => clearTimeout(fadeTimer);
  }, []);

  // Progreso del sistema
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setSystemProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Iniciar fade-out
          setFadeState('fade-out');
          setTimeout(() => onComplete(), 1500); // Esperar a que termine el fade-out (1.5s)
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Sistema de partículas ULTRA-OPTIMIZADO
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true, // Mejor performance en algunos navegadores
      willReadFrequently: false
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reducir a 25 partículas en móvil, 30 en desktop
    const particleCount = window.innerWidth < 768 ? 20 : 25;
    const maxDistance = 150; // Precalcular
    const maxDistanceSq = maxDistance * maxDistance; // Evitar sqrt cuando sea posible
    
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));

    // Colores precalculados
    const colors = [
      'rgba(99, 102, 241, ',
      'rgba(168, 85, 247, ',
      'rgba(236, 72, 153, '
    ];
    
    // Variables para throttling
    let frameCount = 0;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const animate = () => {
      frameCount++;
      
      // Limpiar canvas
      ctx.fillStyle = '#0b0125';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const particles = particlesRef.current;
      const len = particles.length;

      // Actualizar y dibujar partículas
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        
        // Actualizar posición
        p.x += p.vx;
        p.y += p.vy;

        // Rebotar en bordes (optimizado con operadores ternarios)
        p.vx = (p.x < 0 || p.x > canvasWidth) ? -p.vx : p.vx;
        p.vy = (p.y < 0 || p.y > canvasHeight) ? -p.vy : p.vy;

        // Dibujar partícula (sin shadow para mejor performance)
        ctx.fillStyle = `${colors[i % 3]}${p.opacity})`;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }

      // Conectar partículas solo cada 2 frames para reducir cálculos a la mitad
      if (frameCount % 2 === 0) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < len; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < len; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy; // Evitar sqrt

            if (distSq < maxDistanceSq) {
              const dist = Math.sqrt(distSq); // Solo calcular cuando sea necesario
              const opacity = 0.15 * (1 - dist / maxDistance);
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`hud-boot-screen hud-${fadeState}`}>
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} className="hud-canvas" />

      {/* Scanlines effect */}
      <div className="hud-scanlines" />

      {/* Círculo Central Principal */}
      <div className="hud-center-circle">
        {/* Anillos externos rotatorios */}
        <div className="hud-ring hud-ring-outer-1" />
        <div className="hud-ring hud-ring-outer-2" />
        <div className="hud-ring hud-ring-outer-3" />
        
        {/* Anillo con marcas de medición */}
        <div className="hud-measurement-ring">
          {Array.from({ length: 36 }).map((_, i) => (
            <div 
              key={i} 
              className="hud-tick"
              style={{ transform: `rotate(${i * 10}deg)` }}
            />
          ))}
        </div>

        {/* Orbe central pulsante */}
        <div className="hud-orb">
          <div className="hud-orb-inner" />
        </div>

        {/* Texto central con typewriter */}
        <div className="hud-center-text">
          {typewriterText}
          {showCursor && <span className="hud-cursor">_</span>}
        </div>

        {/* Línea de escaneo horizontal */}
        <div className="hud-scan-line" />
      </div>

      {/* Panel Superior Izquierdo - Fecha y Sistema */}
      <div className="hud-panel hud-panel-top-left">
        <div className="hud-date-display">
          <div className="hud-date-circle">
            <span className="text-4xl font-bold">{currentTime.getDate()}</span>
            <span className="text-sm uppercase">
              {currentTime.toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>
        </div>
        
        <div className="hud-system-indicators">
          <div className="hud-indicator">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs">STORAGE: 256GB</span>
            <div className="hud-progress-ring" style={{ '--progress': 75 }} />
          </div>
          <div className="hud-indicator">
            <Zap className="w-4 h-4" />
            <span className="text-xs">POWER: 100%</span>
            <div className="hud-progress-bar">
              <div className="hud-progress-fill" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Reloj y Clima */}
      <div className="hud-panel hud-panel-right">
        <div className="hud-clock">
          <div className="text-5xl font-bold tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-cyan-400/70 mt-1">
            Quito, Ecuador • {currentTime.getSeconds()}s
          </div>
        </div>

        <div className="hud-weather-widget">
          <div className="hud-weather-icon">
            <Moon className="w-12 h-12" />
          </div>
          <div className="text-3xl font-bold">13°C</div>
        </div>

        <div className="hud-weather-details">
          <div className="hud-weather-item">
            <Droplets className="w-4 h-4" />
            <span>68%</span>
          </div>
          <div className="hud-weather-item">
            <Wind className="w-4 h-4" />
            <span>12 km/h</span>
          </div>
          <div className="hud-weather-item">
            <Sun className="w-4 h-4" />
            <span>06:30</span>
          </div>
        </div>

        <div className="hud-events">
          <Calendar className="w-4 h-4" />
          <span className="text-xs">SYSTEM BOOT SEQUENCE</span>
        </div>
      </div>

      {/* Panel Inferior Izquierdo - Comunicaciones */}
      <div className="hud-panel hud-panel-bottom-left">
        <div className="hud-comms-section">
          <Mail className="w-5 h-5" />
          <span className="text-xs">NEW MESSAGES: 0</span>
        </div>
        
        <div className="hud-status-grid">
          <div className="hud-status-item">
            <div className="hud-status-dot" />
            <span>NETWORK ONLINE</span>
          </div>
          <div className="hud-status-item">
            <div className="hud-status-dot" />
            <span>SECURITY ACTIVE</span>
          </div>
        </div>

        <div className="hud-power-controls">
          <button className="hud-power-btn">
            <Power className="w-4 h-4" />
          </button>
          <button className="hud-power-btn">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Inferior Derecha - Carga de Datos */}
      <div className="hud-panel hud-panel-bottom-right">
        <div className="hud-waveform">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="hud-wave-bar"
              style={{ 
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
        
        <div className="hud-load-stats">
          <span className="text-xs">UPLOAD: {(Math.random() * 10).toFixed(1)} MB/s</span>
          <span className="text-xs">DOWNLOAD: {(Math.random() * 50).toFixed(1)} MB/s</span>
        </div>
      </div>

      {/* Líneas de conexión decorativas */}
      <svg className="hud-connections" width="100%" height="100%">
        <line x1="20%" y1="30%" x2="35%" y2="50%" className="hud-connection-line" />
        <line x1="80%" y1="30%" x2="65%" y2="50%" className="hud-connection-line" />
        <line x1="50%" y1="80%" x2="50%" y2="60%" className="hud-connection-line" />
      </svg>

      {/* Indicador de progreso global */}
      <div className="hud-global-progress">
        <div className="hud-global-progress-bar">
          <div 
            className="hud-global-progress-fill" 
            style={{ width: `${systemProgress}%` }}
          />
        </div>
        <span className="text-xs text-cyan-400/70 mt-2">
          INITIALIZING... {systemProgress}%
        </span>
      </div>
    </div>
  );
});

HUDBootScreen.displayName = 'HUDBootScreen';

export default HUDBootScreen;

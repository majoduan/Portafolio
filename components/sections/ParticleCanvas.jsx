'use client';
import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const ParticleCanvas = React.memo(() => {
  const { theme } = useContext(AppContext);
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const themeRef = useRef(theme);

  // Sincronizar themeRef sin re-ejecutar el effect de particulas
  useEffect(() => { themeRef.current = theme; }, [theme]);

  // Particle system OPTIMIZADO v3.0
  // Fixes: resize bug, batch lines, tab visibility, 30fps mobile, themeRef (no flash on theme change)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 8 : 20;
    const maxDistance = 80;
    const maxDistanceSq = maxDistance * maxDistance;
    const MIN_SPEED = 0.15;
    const MIN_SPEED_SQ = MIN_SPEED * MIN_SPEED;
    const BASE_SPEED = 0.25;
    const BASE_SPEED_SQ = BASE_SPEED * BASE_SPEED;
    const TRAIL_ALPHA = 0.88;

    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.5
    }));

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId;
    let frameCount = 0;
    // Usar let para que handleResize pueda actualizarlas (fix del bug de resize)
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    let isTabVisible = true;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Pausar animacion cuando la pestana no esta activa (ahorra bateria/CPU)
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        // Limpiar trails stale acumulados mientras el tab estaba oculto
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      // No animar si tab no es visible
      if (!isTabVisible) return;

      frameCount++;

      // 30fps en movil (skip frames alternos) - efecto identico con 8 particulas
      if (isMobile && frameCount % 2 !== 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Leer tema actual desde ref (sin dependency en theme -> no destruye particulas)
      const isDark = themeRef.current === 'dark';

      // Trail effect: fade pixeles existentes reduciendo su alpha (preserva transparencia del canvas)
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.globalCompositeOperation = 'source-over';

      const particlesArray = particles.current;
      const len = particlesArray.length;

      // Colores segun tema (dark: blanco brillante, light: negro puro)
      const particleColor = isDark ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
      const lineColor = isDark ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
      const opacityMultiplier = isDark ? 1 : 0.9;

      for (let i = 0; i < len; i++) {
        const p = particlesArray[i];

        // Mouse interaction solo cada 3 frames
        if (frameCount % 3 === 0) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 10000) {
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100;
            p.vx -= (dx / dist) * force * 0.2;
            p.vy -= (dy / dist) * force * 0.2;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Friccion adaptiva: fuerte cuando rapido (post-mouse), suave cerca de velocidad base
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > BASE_SPEED_SQ) {
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else {
          p.vx *= 0.99;
          p.vy *= 0.99;
        }

        // Velocidad minima — las particulas nunca se detienen
        if (speedSq < MIN_SPEED_SQ) {
          if (speedSq > 0) {
            const scale = MIN_SPEED / Math.sqrt(speedSq);
            p.vx *= scale;
            p.vy *= scale;
          } else {
            const angle = Math.random() * Math.PI * 2;
            p.vx = Math.cos(angle) * MIN_SPEED;
            p.vy = Math.sin(angle) * MIN_SPEED;
          }
        }

        // Bounce off edges — clamp position and reverse velocity
        if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        else if (p.x >= canvasWidth) { p.x = canvasWidth; p.vx = -Math.abs(p.vx); }
        if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        else if (p.y >= canvasHeight) { p.y = canvasHeight; p.vy = -Math.abs(p.vy); }

        ctx.fillStyle = `${particleColor}${p.opacity * opacityMultiplier})`;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }

      // Conectar particulas cada 2 frames - BATCHED en un solo path por opacidad
      if (frameCount % 2 === 0) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `${lineColor}${isDark ? 0.12 : 0.18})`;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const p1 = particlesArray[i];
          for (let j = i + 1; j < len; j++) {
            const p2 = particlesArray[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistanceSq) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Actualizar las variables locales (fix del bug de resize)
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // SIN theme - usa themeRef para cambio suave de colores

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';

export default ParticleCanvas;

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

    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
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

      // Limpiar canvas completamente (canvas es transparente, el fondo CSS se ve a través)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const particlesArray = particles.current;
      const len = particlesArray.length;

      // Colores segun tema
      const particleColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(51, 65, 85, ';
      const lineColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(51, 65, 85, ';
      const opacityMultiplier = isDark ? 1 : 0.8;

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
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundary check usando canvasWidth/canvasHeight actualizables
        if (p.x < 0 || p.x > canvasWidth) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvasHeight) p.vy = -p.vy;

        ctx.fillStyle = `${particleColor}${p.opacity * opacityMultiplier})`;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }

      // Conectar particulas cada 2 frames - BATCHED en un solo path por opacidad
      if (frameCount % 2 === 0) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `${lineColor}${isDark ? 0.08 : 0.12})`;
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

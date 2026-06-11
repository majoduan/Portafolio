'use client';
import React, { useEffect, useRef, useContext } from 'react';
import createGlobe from 'cobe';
import { AppContext } from '../../contexts/AppContext';

// Quito, Ecuador — [lat, lng]
const QUITO = [-0.18, -78.47];
const THETA = 0.25; // inclinación del globo
const SCALE = 1.18; // agranda la esfera dentro del canvas (cobe `scale`)
const MARKER_ELEVATION = 0.05; // = markerElevation por defecto de cobe
const GLOBE_RADIUS = 0.8 + MARKER_ELEVATION; // cobe: ee + p

// El globo se renderiza IGUAL en ambos temas: relleno casi-negro (dark:1) + puntos
// claros + borde sutil del color de los puntos (glowColor = baseColor, sin verde).
// cobe siempre rellena la esfera con un disco opaco oscuro: sobre fondo oscuro es
// invisible (queda "transparente"), pero sobre fondo claro se vería negro. Para el
// tema CLARO invertimos el canvas por CSS (filter: invert): el relleno negro pasa a
// blanco (se funde con el fondo claro) y los puntos claros pasan a oscuros (visibles).
// El marcador es un overlay DOM aparte → no se invierte, sigue verde en ambos temas.
const GLOBE = { dark: 1, diffuse: 1.2, mapBrightness: 5, baseColor: [0.55, 0.6, 0.7], glowColor: [0.55, 0.6, 0.7] };
const GLOBE_OPACITY = 0.9;
const filterFor = (theme) => (theme === 'light' ? 'invert(1) brightness(1.05)' : 'none');

const samplesForWidth = (w) => (w < 768 ? 8000 : w < 1024 ? 11000 : 16000);

// Proyección (replica la de cobe) para ubicar el marcador DOM sobre Quito.
const PI = Math.PI;
const lonLatToVec3 = ([lat, lng]) => {
  const r = (lat * PI) / 180;
  const a = (lng * PI) / 180 - PI;
  const o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
};
const project = ([lat, lng], phi, theta, aspect, scale) => {
  const v = lonLatToVec3([lat, lng]);
  const x0 = v[0] * GLOBE_RADIUS;
  const y0 = v[1] * GLOBE_RADIUS;
  const z0 = v[2] * GLOBE_RADIUS;
  const cr = Math.cos(theta);
  const so = Math.sin(theta);
  const ca = Math.cos(phi);
  const si = Math.sin(phi);
  const c = ca * x0 + si * z0;
  const s = si * so * x0 + cr * y0 - ca * so * z0;
  const zc = -si * cr * x0 + so * y0 + ca * cr * z0; // hacia la cámara
  return { x: (c / aspect * scale + 1) / 2, y: (-s * scale + 1) / 2, front: zc >= 0 };
};

// Globo de puntos (cobe v2) como fondo de la hero de /about.
// cobe v2 no tiene loop interno: se corre un RAF propio que llama globe.update({ phi }).
// El marcador (punto verde + núcleo blanco + anillo pulsante) es un overlay DOM/CSS
// posicionado proyectando Quito cada frame, así controlamos su look y lo ocultamos
// cuando rota al lado oculto del globo.
const AboutGlobe = React.memo(() => {
  const { theme } = useContext(AppContext);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const markerRef = useRef(null);
  const globeRef = useRef(null);

  const phiRef = useRef(0);
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);
  const sizeRef = useRef({ w: 1, h: 1 });
  const aspectRef = useRef(1);
  const themeRef = useRef(theme);

  // Crear el globo UNA sola vez
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      sizeRef.current = { w: Math.max(1, rect.width), h: Math.max(1, rect.height) };
      aspectRef.current = sizeRef.current.w / sizeRef.current.h;
    };
    measure();

    const applyCssSize = () => {
      canvas.style.width = `${sizeRef.current.w}px`;
      canvas.style.height = `${sizeRef.current.h}px`;
    };

    const updateMarker = () => {
      const m = markerRef.current;
      if (!m) return;
      const { x, y, front } = project(QUITO, phiRef.current, THETA, aspectRef.current, SCALE);
      m.style.left = `${x * 100}%`;
      m.style.top = `${y * 100}%`;
      m.style.opacity = front ? '1' : '0';
    };

    const globe = createGlobe(canvas, {
      width: sizeRef.current.w,
      height: sizeRef.current.h,
      devicePixelRatio: dpr,
      phi: phiRef.current,
      theta: THETA,
      dark: GLOBE.dark,
      diffuse: GLOBE.diffuse,
      mapSamples: samplesForWidth(window.innerWidth),
      mapBrightness: GLOBE.mapBrightness,
      baseColor: GLOBE.baseColor,
      glowColor: GLOBE.glowColor,
      markerColor: GLOBE.baseColor, // el marcador real es el overlay DOM
      scale: SCALE,
      opacity: 1,
      markers: [], // sin marcador WebGL: lo dibujamos en DOM/CSS
    });
    globeRef.current = globe;

    // cobe envuelve el canvas en un div (100%x100%); el canvas llena ese div y la
    // sección. La máscara radial va en ese wrapper (no en el marcador, que es hermano).
    const inner = canvas.parentElement;
    if (inner) {
      inner.style.maskImage = 'radial-gradient(circle at center, black 72%, transparent 96%)';
      inner.style.webkitMaskImage = 'radial-gradient(circle at center, black 72%, transparent 96%)';
    }
    canvas.style.opacity = String(GLOBE_OPACITY);
    canvas.style.filter = filterFor(themeRef.current); // invert en tema claro
    applyCssSize();
    updateMarker();

    // ── RAF loop propio (cobe v2 no anima solo) ──
    let raf = null;
    let warm = 0;
    const WARM_FRAMES = 100; // ~1.6s: asegura que la textura async del mapa se dibuje

    const frame = () => {
      if (pausedRef.current) {
        raf = null;
        return;
      }
      const spin = !reducedRef.current;
      if (spin) phiRef.current += 0.0035; // giro lento
      globe.update({ phi: phiRef.current, theta: THETA });
      updateMarker();
      warm++;
      raf = spin || warm < WARM_FRAMES ? requestAnimationFrame(frame) : null;
    };
    const kick = () => {
      if (raf == null && !pausedRef.current) {
        warm = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    kick();

    // Resize con debounce
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        applyCssSize();
        globe.update({ width: sizeRef.current.w, height: sizeRef.current.h, phi: phiRef.current, theta: THETA });
        updateMarker();
        kick();
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Pausa cuando la pestaña no está visible
    let inView = true;
    const onVisibility = () => {
      pausedRef.current = document.hidden || !inView;
      if (!pausedRef.current) kick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pausa cuando la hero sale del viewport
    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          pausedRef.current = !inView || document.hidden;
          if (!pausedRef.current) kick();
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    }

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (observer) observer.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  // Cambio de tema → solo alternar el filtro CSS (los params de cobe son idénticos;
  // el tema claro invierte el canvas para fundir el relleno con el fondo claro).
  useEffect(() => {
    themeRef.current = theme;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.filter = filterFor(theme);
  }, [theme]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} />
      {/* Scrim adaptativo al tema: mejora la legibilidad del texto sobre el globo */}
      <div className="globe-scrim" aria-hidden="true" />
      <div ref={markerRef} className="globe-marker">
        <span className="globe-marker-ring" />
        <span className="globe-marker-core" />
      </div>
    </div>
  );
});

AboutGlobe.displayName = 'AboutGlobe';

export default AboutGlobe;

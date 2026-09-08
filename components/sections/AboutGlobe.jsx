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

    // Canvas CUADRADO centrado (lado = alto de la sección) en lugar de ocupar
    // toda la sección: en el shader de cobe el radio de la esfera depende solo
    // de la altura del canvas (la x se corrige por aspecto), y la máscara
    // radial vive en el contenedor (no en el canvas), así que el globo se ve
    // idéntico pintando ~60 % menos píxeles por frame en pantallas anchas.
    // En secciones más altas que anchas (móvil) se mantiene el canvas completo.
    const box = { w: 1, h: 1, left: 0, top: 0 }; // caja CSS del canvas dentro del wrap
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const W = Math.max(1, rect.width);
      const H = Math.max(1, rect.height);
      if (W > H) {
        box.w = H; box.h = H; box.left = (W - H) / 2; box.top = 0;
      } else {
        box.w = W; box.h = H; box.left = 0; box.top = 0;
      }
      sizeRef.current = { w: box.w, h: box.h };
      aspectRef.current = box.w / box.h;
    };
    measure();

    const applyCssSize = () => {
      canvas.style.position = 'absolute';
      canvas.style.left = `${box.left}px`;
      canvas.style.top = `${box.top}px`;
      canvas.style.width = `${box.w}px`;
      canvas.style.height = `${box.h}px`;
    };

    const updateMarker = () => {
      const m = markerRef.current;
      if (!m) return;
      const { x, y, front } = project(QUITO, phiRef.current, THETA, aspectRef.current, SCALE);
      // Proyección relativa al canvas -> píxeles del wrap (offsetParent del marcador)
      m.style.left = `${box.left + x * box.w}px`;
      m.style.top = `${box.top + y * box.h}px`;
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

    // La máscara radial va en el contenedor del canvas (el wrap absolute inset-0),
    // no en el marcador (hermano) ni en el canvas: así el fundido a los bordes es
    // el de la sección, independiente del tamaño del canvas.
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

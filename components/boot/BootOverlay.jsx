'use client';
import React, { useEffect, useRef } from 'react';
import { bootStore } from '../../lib/boot/bootStore';

/**
 * BootOverlay — overlay fijo (z-index 9999) con el "circuit boot".
 *
 * Se renderiza en el servidor como un fondo negro (sin flash de contenido) y en
 * el cliente crea un <canvas> cuyo control se transfiere a un Web Worker
 * (OffscreenCanvas). El worker dibuja circuitos, orbe, barra y etiqueta a
 * 60 fps aunque el hilo principal esté bloqueado compilando Spline o parseando
 * la escena. Sin OffscreenCanvas, el mismo renderer corre en el hilo principal.
 *
 * El progreso llega del bootStore (hitos reales fijados por el orquestador).
 * Ninguna actualización pasa por React por frame.
 */
export default function BootOverlay({ fading }) {
  const hostRef = useRef(null);
  const ariaRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Canvas creado imperativamente: transferControlToOffscreen() solo puede
    // llamarse una vez por elemento y StrictMode (dev) monta el efecto dos veces.
    const canvas = document.createElement('canvas');
    canvas.className = 'cb__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    let reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const dims = () => ({ width: window.innerWidth, height: window.innerHeight });

    let worker = null;
    let renderer = null;
    let rafId = 0;
    let disposed = false;

    const onDisplayed = (value) => {
      if (disposed) return;
      bootStore.set({ displayed: value });
      if (ariaRef.current) ariaRef.current.setAttribute('aria-valuenow', String(Math.round(value)));
    };

    const initial = bootStore.get();
    const canOffscreen =
      typeof window.Worker !== 'undefined' &&
      typeof window.OffscreenCanvas !== 'undefined' &&
      typeof canvas.transferControlToOffscreen === 'function';

    if (canOffscreen) {
      try {
        worker = new Worker(new URL('../../workers/boot-renderer.worker.js', import.meta.url));
        const offscreen = canvas.transferControlToOffscreen();
        worker.onmessage = (e) => {
          if (!e.data || e.data.type !== 'displayed') return;
          onDisplayed(e.data.value);
          // Métricas de fluidez del worker (solo lectura; para medir con DevTools/Playwright)
          window.__bootStats = { mode: 'worker', ...e.data.stats, displayed: e.data.value };
        };
        worker.postMessage(
          { type: 'init', canvas: offscreen, ...dims(), dpr, reducedMotion: reduced, target: initial.target, cap: initial.cap },
          [offscreen]
        );
      } catch {
        if (worker) { try { worker.terminate(); } catch { /* ignore */ } }
        worker = null;
      }
    }

    if (!worker) {
      // Fallback: mismo renderer en el hilo principal (sin React por frame)
      import('../../lib/boot/renderer').then(({ createBootRenderer }) => {
        if (disposed) return;
        try {
          renderer = createBootRenderer(canvas, {
            ...dims(), dpr, reducedMotion: reduced,
            onDisplayed: (v) => { onDisplayed(v); window.__bootStats = { mode: 'main-thread', displayed: v }; },
          });
          renderer.setProgress(bootStore.get().target, bootStore.get().cap);
          if (reduced) renderer.frame(performance.now());
          else {
            const loop = (now) => { if (disposed) return; renderer.frame(now); rafId = requestAnimationFrame(loop); };
            rafId = requestAnimationFrame(loop);
          }
        } catch { /* sin canvas 2D: queda el fondo negro */ }
      });
    }

    const send = (msg) => {
      if (worker) { try { worker.postMessage(msg); } catch { /* ignore */ } }
      else if (renderer) {
        if (msg.type === 'progress') renderer.setProgress(msg.target, msg.cap);
        else if (msg.type === 'resize') renderer.resize(msg.width, msg.height, msg.dpr);
      }
    };

    let lastTarget = initial.target;
    let lastCap = initial.cap;
    const unsubscribe = bootStore.subscribe((s) => {
      if (s.target !== lastTarget || s.cap !== lastCap) {
        lastTarget = s.target; lastCap = s.cap;
        send({ type: 'progress', target: s.target, cap: s.cap });
      }
    });

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => send({ type: 'resize', ...dims(), dpr }), 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      disposed = true;
      unsubscribe();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (renderer) renderer.destroy();
      if (worker) {
        try { worker.postMessage({ type: 'stop' }); } catch { /* ignore */ }
        try { worker.terminate(); } catch { /* ignore */ }
      }
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={hostRef} className={`cb ${fading ? 'cb--fade-out' : 'cb--visible'}`}>
      <div
        ref={ariaRef}
        role="progressbar"
        aria-label="Loading portfolio"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="sr-only"
      />
    </div>
  );
}

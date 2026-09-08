// Web Worker que dibuja el boot screen sobre un OffscreenCanvas.
// Mientras el hilo principal compila el runtime de Spline, hidrata React y
// parsea la escena 3D, este hilo sigue produciendo frames a 60 fps.
import { createBootRenderer } from '../lib/boot/renderer';

let renderer = null;
let rafId = null;
let stopped = false;

// Estadísticas de fluidez del propio worker (frames pintados, peor hueco entre
// frames y huecos > 34 ms). Se envían junto al progreso; el overlay las expone
// en window.__bootStats para medir sin alterar el dibujo.
const stats = { frames: 0, worstGapMs: 0, gapsOver34: 0, lastFrame: 0 };

const raf = typeof self.requestAnimationFrame === 'function'
  ? (cb) => self.requestAnimationFrame(cb)
  : (cb) => setTimeout(() => cb(performance.now()), 16);
const caf = typeof self.cancelAnimationFrame === 'function'
  ? (id) => self.cancelAnimationFrame(id)
  : (id) => clearTimeout(id);

const loop = (now) => {
  if (stopped || !renderer) return;
  if (stats.lastFrame) {
    const gap = now - stats.lastFrame;
    if (gap > stats.worstGapMs) stats.worstGapMs = gap;
    if (gap > 34) stats.gapsOver34++;
  }
  stats.lastFrame = now;
  stats.frames++;
  renderer.frame(now);
  rafId = raf(loop);
};

self.onmessage = (event) => {
  const msg = event.data || {};
  switch (msg.type) {
    case 'init': {
      renderer = createBootRenderer(msg.canvas, {
        width: msg.width,
        height: msg.height,
        dpr: msg.dpr,
        reducedMotion: msg.reducedMotion,
        onDisplayed: (value) => self.postMessage({
          type: 'displayed',
          value,
          stats: { frames: stats.frames, worstGapMs: Math.round(stats.worstGapMs), gapsOver34: stats.gapsOver34 },
        }),
      });
      if (typeof msg.target === 'number') renderer.setProgress(msg.target, msg.cap);
      if (msg.reducedMotion) renderer.frame(performance.now());
      else rafId = raf(loop);
      break;
    }
    case 'progress':
      if (renderer) renderer.setProgress(msg.target, msg.cap);
      break;
    case 'resize':
      if (renderer) renderer.resize(msg.width, msg.height, msg.dpr);
      break;
    case 'stop':
      stopped = true;
      if (rafId != null) caf(rafId);
      if (renderer) renderer.destroy();
      renderer = null;
      self.close();
      break;
    default:
      break;
  }
};

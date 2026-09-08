// Orquestador del boot screen: convierte hitos REALES de carga en objetivos de
// progreso y decide cuándo termina el overlay.
//
// Tramos (desktop con escena 3D):
//   0→15   hidratación (este módulo ya corre)
//   15→40  runtime de Spline importado (chunk de ~2 MB compilado)
//   40→85  descarga de la escena (bytes reales vía sceneSource)
//   85→100 escena parseada y primera imagen lista (app.start resuelto)
// Sin escena (móvil, /about, /projects, política 'galaxy'):
//   0→15 hidratación · 15→60 fuentes críticas listas · 100
//
// Presupuestos: mínimo 2,5 s (el intro es firma visual); máximo 8 s con escena,
// 4 s sin ella. Si la escena no llega a tiempo el overlay se levanta igual: la
// galaxia ya está visible debajo y la escena se funde cuando termine.
// prefers-reduced-motion: sin mínimo y cierre en 500 ms.

import { bootStore } from './bootStore';
import { sceneSource } from '../spline/sceneSource';
import { getScenePolicy } from '../scenePolicy';

const MIN_MS = 2500;
const MAX_WITH_SCENE_MS = 8000;
const MAX_NO_SCENE_MS = 4000;
const FADE_MS = 800;
const FADE_REDUCED_MS = 500;

export function wantsSceneOnBoot(pathname) {
  if (typeof window === 'undefined') return false;
  if (pathname !== '/') return false;
  let wide = false;
  try { wide = window.matchMedia('(min-width: 768px)').matches; } catch { /* ignore */ }
  return wide && getScenePolicy() === 'spline';
}

const waitDisplayed = (value, timeoutMs) => new Promise((resolve) => {
  if (bootStore.get().displayed >= value) return resolve();
  const timer = setTimeout(() => { unsub(); resolve(); }, timeoutMs);
  const unsub = bootStore.subscribe((s) => {
    if (s.displayed >= value) { clearTimeout(timer); unsub(); resolve(); }
  });
});

export function runBootSequence({ pathname, onFadeStart, onDone }) {
  // El overlay es visible desde el primer paint (SSR), así que el mínimo se
  // cuenta desde el inicio de la navegación (performance.now() = 0), no desde
  // la hidratación: bajo CPU lenta la hidratación tarda >1 s y alargaba el boot.
  const start = 0;
  let reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
  const withScene = wantsSceneOnBoot(pathname);
  const maxMs = withScene ? MAX_WITH_SCENE_MS : MAX_NO_SCENE_MS;

  let finishing = false;
  let cancelled = false;

  const finish = async () => {
    if (finishing || cancelled) return;
    finishing = true;
    clearTimeout(maxTimer);
    bootStore.set({ target: 100, cap: 100 });
    if (!reduced) {
      // Deja que la barra llegue visualmente a 100 y respeta el mínimo
      await waitDisplayed(99.5, 1500);
      const elapsed = performance.now() - start;
      if (elapsed < MIN_MS) await new Promise((r) => setTimeout(r, MIN_MS - elapsed));
      await new Promise((r) => setTimeout(r, 250)); // respiro a 100 % antes del fade
    }
    if (cancelled) return;
    bootStore.set({ phase: 'fade-out' });
    onFadeStart?.();
    setTimeout(() => {
      if (cancelled) return;
      bootStore.set({ phase: 'done', done: true });
      onDone?.();
    }, reduced ? FADE_REDUCED_MS : FADE_MS);
  };

  const maxTimer = setTimeout(finish, maxMs);

  (async () => {
    bootStore.set({ target: 15, cap: 39 }); // hidratado

    if (withScene) {
      // Descarga de la escena y compilación del runtime en paralelo
      const scenePromise = sceneSource.getBuffer().catch(() => null);
      try { await import('@splinetool/runtime'); } catch { /* HeroSection mostrará la galaxia */ }
      if (cancelled) return;
      bootStore.set({ target: 40, cap: 84 });

      const unsub = sceneSource.onProgress((p) => {
        bootStore.set({ target: 40 + Math.round(p * 44), cap: 84 });
      });
      await scenePromise;
      unsub();
      if (cancelled) return;
      bootStore.set({ target: 85, cap: 99 });

      await sceneSource.ready; // 'ready' | 'failed' (lo resuelve HeroSection)
    } else {
      // Fuentes críticas (Geist) — acotado: `display: swap` ya evita texto
      // invisible, y fonts.ready puede resolver tarde bajo CPU limitada.
      try {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
      } catch { /* ignore */ }
      if (cancelled) return;
      bootStore.set({ target: 60, cap: 99 });
    }
    finish();
  })();

  return {
    cancel() { cancelled = true; clearTimeout(maxTimer); },
  };
}

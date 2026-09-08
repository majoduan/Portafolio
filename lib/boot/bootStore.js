// Store mínimo (sin React) del estado del boot screen.
//
// - target/cap: progreso objetivo (hito real alcanzado) y tope del tramo actual.
//   Los fija el orquestador; el renderer interpola `displayed` por frame.
// - displayed: valor pintado (lo reporta el renderer a ~10 Hz para aria/finish).
// - phase: 'visible' | 'fade-out' | 'done'.
// - done: true cuando el overlay ha desaparecido. Persiste entre navegaciones
//   SPA (módulo) y se reinicia en cada carga dura: sustituye al antiguo
//   `let introShown` de BootScreenWrapper.
//
// Nunca pasa por React por frame: los componentes que necesitan `done` usan
// useSyncExternalStore (hooks/useBootDone).

const listeners = new Set();

let state = {
  target: 0,
  cap: 100,
  displayed: 0,
  phase: 'visible',
  done: false,
};

export const bootStore = {
  get: () => state,
  set(partial) {
    let changed = false;
    for (const k in partial) {
      if (state[k] !== partial[k]) { changed = true; break; }
    }
    if (!changed) return;
    state = { ...state, ...partial };
    // Línea de tiempo de hitos (sin `displayed`) para medir el boot desde
    // DevTools/Playwright: window.__bootTimeline = [{ t, target, cap, phase }]
    if (typeof window !== 'undefined' && !('displayed' in partial)) {
      const tl = (window.__bootTimeline = window.__bootTimeline || []);
      if (tl.length < 40) tl.push({ t: Math.round(performance.now()), ...partial });
    }
    listeners.forEach((l) => l(state));
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

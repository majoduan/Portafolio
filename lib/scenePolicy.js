// Decide de antemano si el hero muestra la escena Spline o la galaxia SVG.
//
// Antes: la galaxia solo aparecía si Spline no respondía en 10 s (spinner
// mientras tanto). Ahora la decisión se toma ANTES de montar el hero con
// señales del dispositivo/red, y la galaxia es el estado inicial visible en
// cualquier caso (se funde con la escena cuando llega).
//
// 'galaxy' si: ahorro de datos, 2g/3g, poca memoria/CPU, prefers-reduced-data,
// sin WebGL, o la última carga de la escena en este equipo tardó > 8 s (en las
// últimas 24 h). Forzable con ?scene=3d | ?scene=galaxy para pruebas.
// El breakpoint (< 768 px => sin escena) lo sigue decidiendo el hero.

const SESSION_KEY = 'scene-policy-v1';
const LAST_LOAD_KEY = 'scene-last-load-v1';
const SLOW_LOAD_MS = 8000;
const SLOW_MEMORY_MS = 24 * 60 * 60 * 1000;

let cached = null;

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

export function getScenePolicy() {
  if (typeof window === 'undefined') return 'galaxy';
  if (cached) return cached;

  try {
    const forced = new URLSearchParams(window.location.search).get('scene');
    if (forced === '3d' || forced === 'spline') return (cached = 'spline');
    if (forced === 'galaxy') return (cached = 'galaxy');
  } catch { /* ignore */ }

  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    if (s === 'spline' || s === 'galaxy') return (cached = s);
  } catch { /* ignore */ }

  const nav = navigator;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const slowNet = !!conn && (conn.saveData === true || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ''));
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;
  const lowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2;
  let reducedData = false;
  try { reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches; } catch { /* ignore */ }

  let slowHistory = false;
  try {
    const raw = localStorage.getItem(LAST_LOAD_KEY);
    if (raw) {
      const { ms, at } = JSON.parse(raw);
      slowHistory = ms > SLOW_LOAD_MS && Date.now() - at < SLOW_MEMORY_MS;
    }
  } catch { /* ignore */ }

  cached = slowNet || lowMemory || lowCpu || reducedData || slowHistory || !hasWebGL()
    ? 'galaxy'
    : 'spline';

  try { sessionStorage.setItem(SESSION_KEY, cached); } catch { /* ignore */ }
  return cached;
}

/** Registra cuánto tardó la escena en estar lista (para la política futura). */
export function recordSceneLoad(ms) {
  try {
    localStorage.setItem(LAST_LOAD_KEY, JSON.stringify({ ms: Math.round(ms), at: Date.now() }));
  } catch { /* ignore */ }
}

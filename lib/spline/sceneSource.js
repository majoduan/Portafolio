// Fuente única de la escena Spline (.splinecode).
//
// Descarga la escena con `fetch` + ReadableStream para tener progreso REAL de
// bytes durante el boot screen, y entrega el ArrayBuffer al runtime con
// `app.start(buffer)` (sin segunda descarga). El Service Worker (prod) cachea
// la URL con stale-while-revalidate: la segunda visita se sirve al instante.
//
// `ready` es una promesa que HeroSection resuelve cuando el runtime terminó
// `start()` (o falló). El orquestador del boot la espera para no levantar el
// overlay con un spinner detrás.

export const SCENE_URL = 'https://prod.spline.design/CTzlK88G4nA0eFUO/scene.splinecode';

// Tamaño decodificado aproximado (brotli en red ≈ 2,08 MB; 9,18 MB descomprimidos).
// El stream entrega bytes YA descomprimidos y CloudFront no expone Content-Length
// cross-origin, así que el progreso se estima contra este valor (clamp 0,98).
const EXPECTED_BYTES = 9_200_000;

let bufferPromise = null;
let buffer = null;
let lastProgress = 0;
const progressListeners = new Set();

let readyStatus = null; // 'ready' | 'failed' | 'skipped'
let resolveReady;
const readyPromise = new Promise((resolve) => { resolveReady = resolve; });

const emit = (p) => {
  lastProgress = p;
  progressListeners.forEach((fn) => fn(p));
};

async function fetchWithProgress() {
  const res = await fetch(SCENE_URL, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`scene fetch ${res.status}`);
  if (!res.body || typeof res.body.getReader !== 'function') {
    const ab = await res.arrayBuffer();
    emit(1);
    return ab;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    emit(Math.min(0.98, received / EXPECTED_BYTES));
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
  emit(1);
  return out.buffer;
}

export const sceneSource = {
  url: SCENE_URL,

  /** ArrayBuffer de la escena (memoizado para la sesión SPA). */
  getBuffer() {
    if (buffer) return Promise.resolve(buffer);
    if (!bufferPromise) {
      bufferPromise = fetchWithProgress()
        .then((ab) => { buffer = ab; return ab; })
        .catch((err) => { bufferPromise = null; throw err; });
    }
    return bufferPromise;
  },

  /** Progreso 0..1 de la descarga. Llama inmediatamente con el valor actual. */
  onProgress(fn) {
    progressListeners.add(fn);
    fn(lastProgress);
    return () => { progressListeners.delete(fn); };
  },

  /**
   * Libera el buffer memoizado (≈9 MB) una vez que el runtime lo consumió.
   * Una futura navegación SPA a la home vuelve a pedir la escena, que el
   * Service Worker / caché HTTP sirven al instante.
   */
  release() {
    buffer = null;
    bufferPromise = null;
  },

  /** Lo llama HeroSection cuando el runtime terminó (o falló / se omitió). */
  markReady(status) {
    if (readyStatus) return;
    readyStatus = status;
    resolveReady(status);
  },

  get status() { return readyStatus; },
  ready: readyPromise,
};

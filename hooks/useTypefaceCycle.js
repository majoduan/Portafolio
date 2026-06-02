'use client';
import { useEffect } from 'react';

/**
 * useTypefaceCycle — efecto "Typeface Transition" del hero (word-at-once) con
 * fuente en reposo que AVANZA entre ráfagas.
 *
 * Flujo: llegas a la página con la fuente original → tras `initialDelay` ocurre
 * una ráfaga (barrido rápido) → el título ATERRIZA y se queda en la fuente 1
 * durante el tiempo muerto → otra ráfaga → se queda en la fuente 2 → … → última
 * fuente → la siguiente ráfaga vuelve a la original, y el ciclo se repite.
 *
 * CLAVE DE LAYOUT — "mantener el espacio, adaptar el tamaño de cada fuente":
 * El espacio que ocupa el título original (Geist) es el de referencia (H0) y NO
 * debe cambiar. Como cada tipografía ocupa un espacio distinto, calculamos para
 * CADA UNA su propio font-size (búsqueda binaria, síncrona ⇒ sin parpadeo) para
 * que su altura renderizada quepa en H0 (considerando el wrap real). Reservamos
 * min-height: H0 y centramos vertical: la caja mide SIEMPRE H0 (igual que el
 * original), así cambiar de fuente nunca empuja el contenido de abajo ni deja
 * huecos. El font-size base nunca se supera (las fuentes solo se reducen).
 *
 * Otras decisiones de rendimiento/calidad:
 * - font-family NO es animable: el efecto es un swap discreto del family.
 * - Fuentes DECORATIVAS cargadas bajo demanda con la CSS Font Loading API
 *   (document.fonts.load) tras requestIdleCallback; el ciclo solo arranca cuando
 *   están listas → sin FOUT a mitad de animación. La calibración corre una vez
 *   tras la carga (y al hacer resize, con debounce).
 * - Pausa cuando el hero sale del viewport (IntersectionObserver) o la pestaña se
 *   oculta (visibilitychange). Al pausar a media ráfaga NO se avanza el reposo.
 * - Respeta prefers-reduced-motion (no hace nada).
 *
 * @param {React.RefObject<HTMLElement>} titleRef  ref al <h1>
 * @param {{family:string, weight:number}[]} fonts  secuencia ordenada por contraste
 * @param {object} options
 */
export function useTypefaceCycle(titleRef, fonts, options = {}) {
  const {
    text = '',
    initialDelay = 3000,   // estado normal inicial antes de la 1ª ráfaga
    deadTimeMin = 10000,   // tiempo muerto mínimo entre ráfagas
    deadTimeMax = 15000,   // tiempo muerto máximo
    swapMs = 100,          // duración de cada tipografía en el barrido
    maxSweep = 14,         // nº de cambios rápidos por ráfaga (independiente de N)
  } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = titleRef.current;
    if (!el || !fonts || fonts.length === 0) return;

    // Accesibilidad: sin movimiento, sin efecto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const N = fonts.length;
    const sizes = new Array(N).fill(0); // font-size calibrado por fuente (px)
    let cancelled = false;
    let timer = null;
    let inView = true;
    let tabVisible = !document.hidden;
    let fontsLoaded = false;
    let calibrated = false;
    let bursting = false;
    let restFont = -1;     // fuente en reposo actual (-1 = original)
    let target = -1;       // fuente en la que aterrizará la ráfaga en curso
    let resizeTimer = null;

    const canRun = () => inView && tabVisible && fontsLoaded && !cancelled;
    const deadTime = () => deadTimeMin + Math.random() * (deadTimeMax - deadTimeMin);
    // Secuencia de reposo: -1(original) → 0 → 1 → … → N-1 → -1 → …
    const nextRest = (k) => { const n = k + 1; return n >= N ? -1 : n; };

    // Aplica una fuente con su tamaño calibrado (-1 = original: limpia inline).
    const applyFont = (idx) => {
      if (idx < 0) {
        el.style.fontFamily = '';
        el.style.fontWeight = '';
        el.style.fontSize = '';
      } else {
        el.style.fontFamily = fonts[idx].family;
        el.style.fontWeight = String(fonts[idx].weight);
        el.style.fontSize = sizes[idx] ? `${sizes[idx]}px` : '';
      }
    };

    // Centrado vertical dentro de la caja fija H0 (sin huecos arriba/abajo).
    const enableBox = () => {
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.justifyContent = 'center';
    };
    const clearBox = () => {
      el.style.display = '';
      el.style.flexDirection = '';
      el.style.justifyContent = '';
      el.style.minHeight = '';
    };

    // Calibración: mide H0 (original) y, por cada fuente, busca el mayor font-size
    // (≤ base) cuya altura renderizada quepa en H0. Todo síncrono ⇒ sin repintar
    // estados intermedios ⇒ sin parpadeo. Reserva min-height: H0.
    const calibrate = () => {
      el.style.minHeight = '';
      // Métricas de referencia con la fuente original a su tamaño base (clamp).
      el.style.fontFamily = '';
      el.style.fontWeight = '';
      el.style.fontSize = '';
      const baseSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const H0 = el.getBoundingClientRect().height;
      const FIT = H0 + 0.5; // tolerancia sub-pixel

      for (let i = 0; i < N; i++) {
        el.style.fontFamily = fonts[i].family;
        el.style.fontWeight = String(fonts[i].weight);

        // ¿Cabe ya a tamaño base? (la mayoría de condensadas/normales).
        el.style.fontSize = `${baseSize}px`;
        if (el.getBoundingClientRect().height <= FIT) {
          sizes[i] = baseSize;
        } else {
          // Búsqueda binaria del mayor tamaño con altura ≤ H0.
          let lo = 6, hi = baseSize, best = 6;
          for (let it = 0; it < 7; it++) {
            const mid = (lo + hi) / 2;
            el.style.fontSize = `${mid}px`;
            if (el.getBoundingClientRect().height <= FIT) { best = mid; lo = mid; }
            else { hi = mid; }
          }
          sizes[i] = best;
        }
      }

      // Restaura la fuente en reposo y fija la caja a H0.
      el.style.fontSize = '';
      applyFont(restFont);
      el.style.minHeight = `${Math.ceil(H0)}px`;
      calibrated = true;
    };

    // Carga diferida; recién aquí (fuentes listas) calibramos y abrimos el ciclo.
    const loadFonts = async () => {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.all(
            fonts.map((f) => document.fonts.load(`${f.weight} 1em ${f.family}`, text || 'Ag'))
          );
        }
      } catch { /* si falla, seguimos: el navegador usará lo que tenga */ }
      if (cancelled) return;
      enableBox();
      calibrate();
      fontsLoaded = true;
    };

    // --- Ráfaga: barrido rápido (variado) que aterriza en la próxima fuente ---
    const startBurst = () => {
      bursting = true;
      target = nextRest(restFont);
      const sweep = Math.min(maxSweep, N);
      const start = Math.floor(Math.random() * N);
      let i = 0;
      const step = () => {
        if (!canRun()) { abortBurst(); return; }
        if (i < sweep) {
          applyFont((start + i) % N);   // recorre la lista (orden por contraste)
          i++;
          timer = setTimeout(step, swapMs);
        } else {
          completeBurst();
        }
      };
      step();
    };

    // Completada: avanza la fuente en reposo y aterriza en ella.
    const completeBurst = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      restFont = target;
      applyFont(restFont);
      bursting = false;
      if (canRun()) scheduleNext(deadTime());
    };

    // Interrumpida (scroll/pestaña): NO avanza; vuelve a la fuente en reposo previa.
    const abortBurst = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      applyFont(restFont);
      bursting = false;
    };

    const scheduleNext = (delay) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fire, delay);
    };

    const fire = () => {
      timer = null;
      if (cancelled) return;
      if (!fontsLoaded) { if (inView && tabVisible) scheduleNext(400); return; }
      if (!inView || !tabVisible) return; // pause() ya limpió; resume reprograma
      startBurst();
    };

    const pause = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      if (bursting) abortBurst();
    };
    const resume = () => {
      if (!cancelled && inView && tabVisible && !timer && !bursting) scheduleNext(deadTime());
    };

    // --- Observers (pausa fuera de viewport / pestaña oculta) ---
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) resume(); else pause();
    }, { threshold: 0 });
    io.observe(el);

    const onVis = () => {
      tabVisible = !document.hidden;
      if (tabVisible) resume(); else pause();
    };
    document.addEventListener('visibilitychange', onVis);

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (calibrated && !bursting) calibrate(); }, 200);
    };
    window.addEventListener('resize', onResize);

    // --- Arranque ---
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    idle(() => { if (!cancelled) loadFonts(); });
    scheduleNext(initialDelay); // 3s de estado normal antes de la 1ª ráfaga

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      clearTimeout(resizeTimer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      applyFont(-1);
      clearBox();
    };
  }, [titleRef, fonts, text, initialDelay, deadTimeMin, deadTimeMax, swapMs, maxSweep]);
}

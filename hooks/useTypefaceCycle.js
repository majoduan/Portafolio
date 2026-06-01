'use client';
import { useEffect } from 'react';

/**
 * useTypefaceCycle — efecto "Typeface Transition" del hero (word-at-once).
 *
 * Todo el título cambia de tipografía a la vez: tras un estado normal inicial,
 * recorre rápidamente la lista de tipografías llamativas y vuelve a la original.
 * Tras un tiempo muerto el ciclo se repite.
 *
 * Decisiones de rendimiento/calidad:
 * - font-family NO es animable: el efecto es un swap discreto del family.
 * - Fuentes DECORATIVAS cargadas bajo demanda con la CSS Font Loading API
 *   (document.fonts.load) tras requestIdleCallback; el ciclo solo arranca cuando
 *   están listas → sin FOUT a mitad de animación.
 * - Durante la ráfaga se fija la altura del título (overflow hidden) para que un
 *   tipo más alto/ancho no empuje el contenido de abajo. font-size nunca cambia.
 * - Pausa cuando el hero sale del viewport (IntersectionObserver) o la pestaña se
 *   oculta (visibilitychange), igual que ParticleCanvas/Spline en este proyecto.
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
    swapMs = 150,          // duración de cada tipografía (más lento = más alto)
  } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = titleRef.current;
    if (!el || !fonts || fonts.length === 0) return;

    // Accesibilidad: sin movimiento, sin efecto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const N = fonts.length;
    let cancelled = false;
    let timer = null;          // setTimeout (programación de fases y de cada swap)
    let inView = true;
    let tabVisible = !document.hidden;
    let fontsLoaded = false;
    let bursting = false;
    let lockedH = 0;

    const canRun = () => inView && tabVisible && fontsLoaded && !cancelled;
    const deadTime = () => deadTimeMin + Math.random() * (deadTimeMax - deadTimeMin);

    // --- Carga diferida de las fuentes decorativas ---
    const loadFonts = async () => {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.all(
            fonts.map((f) => document.fonts.load(`${f.weight} 1em ${f.family}`, text || 'Ag'))
          );
        }
      } catch { /* si falla, seguimos: el navegador usará lo que tenga */ }
      fontsLoaded = true;
    };

    const applyFont = (idx) => {
      if (idx < 0) {
        el.style.fontFamily = '';
        el.style.fontWeight = '';
      } else {
        el.style.fontFamily = fonts[idx].family;
        el.style.fontWeight = String(fonts[idx].weight);
      }
    };

    const lock = () => {
      lockedH = el.getBoundingClientRect().height;
      el.style.height = `${lockedH}px`;
      el.style.overflow = 'hidden';
    };
    const unlock = () => {
      el.style.height = '';
      el.style.overflow = '';
    };

    // --- Una ráfaga: recorre la lista (arranque aleatorio para variar) y vuelve ---
    const startBurst = () => {
      bursting = true;
      lock();
      const start = Math.floor(Math.random() * N);
      let i = 0;
      const step = () => {
        if (!canRun()) { endBurst(); return; }
        if (i < N) {
          applyFont((start + i) % N);   // orden por contraste entre vecinas
          i++;
          timer = setTimeout(step, swapMs);
        } else {
          endBurst();                   // vuelve a la original
        }
      };
      step();
    };

    const endBurst = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      applyFont(-1);
      unlock();
      bursting = false;
      if (canRun()) scheduleNext(deadTime());
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
      if (bursting) { applyFont(-1); unlock(); bursting = false; }
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

    // --- Arranque ---
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    idle(() => { if (!cancelled) loadFonts(); });
    scheduleNext(initialDelay); // 3s de estado normal antes de la 1ª ráfaga

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      applyFont(-1);
      unlock();
    };
  }, [titleRef, fonts, text, initialDelay, deadTimeMin, deadTimeMax, swapMs]);
}

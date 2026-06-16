import { useEffect, useRef, useState } from 'react';

interface ScrollDirectionOptions {
  /** Delta mínimo (px) para reaccionar — evita parpadeo por micro-scrolls. */
  threshold?: number;
  /** Por debajo de este scrollY (px) el nav siempre se muestra (zona del tope). */
  topOffset?: number;
}

/**
 * Auto-hiding sticky header: devuelve `hidden = true` mientras se hace scroll
 * hacia abajo (para ocultar el nav) y `false` al subir o cerca del tope.
 *
 * Espeja el patrón de useScrollPaint: listener `scroll` passive + rAF throttle,
 * sin React state por frame (solo se actualiza el estado al cruzar el umbral),
 * con cleanup en unmount. SSR-safe: `window` solo se toca dentro de useEffect y
 * el estado inicial es `false`, así no hay hydration mismatch.
 * Ref: https://react.dev/reference/react/useEffect
 */
export function useScrollDirection({
  threshold = 6,
  topOffset = 80,
}: ScrollDirectionOptions = {}): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) > threshold) {
        // Cerca del tope siempre visible; si no, ocultar al bajar / mostrar al subir.
        setHidden(y > topOffset && delta > 0);
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, topOffset]);

  return hidden;
}

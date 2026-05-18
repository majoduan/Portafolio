import { useEffect, useRef, type RefObject } from 'react';

type ScrollProgressCallback = (progress: number) => void;

/**
 * Returns a continuous 0→1 scroll progress for a container element.
 * Calls onProgress(value) each frame — no React state, no re-renders.
 *
 * Progress starts the moment the container enters the viewport, and reaches 1
 * by the time the container's bottom hits the viewport center. This gives the
 * paint a much larger scroll budget than tracking the viewport center alone,
 * so the line is fully drawn by the time the user reads the last item.
 *   - 0 when container top is at the viewport bottom (just entering view)
 *   - 1 when container bottom reaches the viewport center
 *
 * Patrón ref para onProgress: si el caller no memoiza el callback con
 * useCallback estable, antes el efecto se desmontaba/montaba en cada render,
 * causando listener leaks y mediciones inconsistentes. Ahora el efecto solo
 * depende de containerRef; el callback se lee siempre desde el ref actualizado.
 * Ref: https://react.dev/learn/separating-events-from-effects
 */
export function useScrollPaint(
  containerRef: RefObject<HTMLElement | null>,
  onProgress: ScrollProgressCallback
): void {
  const rafId = useRef<number | null>(null);
  const ticking = useRef<boolean>(false);
  const onProgressRef = useRef<ScrollProgressCallback>(onProgress);

  // Mantener ref sincronizado sin disparar el efecto principal
  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reduced motion: reveal immediately
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      onProgressRef.current(1);
      return;
    }

    const update = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // Total scroll distance: from "top just entered viewport bottom"
      // to "bottom reached ~25% from viewport top". = rect.height + vh*0.25
      // Smaller denominator → line completes earlier in the scroll, painting
      // feels brisker on desktop and mobile/tablet.
      const total = rect.height + vh * 0.25;
      // How far we've scrolled into that range.
      const scrolled = vh - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      onProgressRef.current(progress);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial measurement
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [containerRef]);
}

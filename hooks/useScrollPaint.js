import { useEffect, useRef } from 'react';

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
 */
export function useScrollPaint(containerRef, onProgress) {
  const rafId = useRef(null);
  const ticking = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reduced motion: reveal immediately
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      onProgress(1);
      return;
    }

    const update = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // Total scroll distance: from "top just entered viewport bottom"
      // to "bottom reached viewport center". = rect.height + vh/2
      const total = rect.height + vh / 2;
      // How far we've scrolled into that range.
      const scrolled = vh - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      onProgress(progress);
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
  }, [containerRef, onProgress]);
}

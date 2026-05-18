'use client';
import { useEffect, useState, type RefObject } from 'react';

interface ReversibleInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

// Bidirectional scroll-reveal hook: toggles inView in BOTH directions
// (entering and leaving the viewport), unlike useIntersectionObserver
// which locks after first intersection.
export function useReversibleInView(
  ref: RefObject<Element | null>,
  { threshold = 0.2, rootMargin = '0px 0px -10% 0px' }: ReversibleInViewOptions = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin]);

  return inView;
}

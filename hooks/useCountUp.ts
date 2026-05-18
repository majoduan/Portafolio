'use client';
import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  enabled?: boolean;
  start?: number;
}

const ease = (t: number): number => t;

export function useCountUp({
  end,
  duration = 1800,
  enabled = true,
  start = 0,
}: UseCountUpOptions): number {
  const [value, setValue] = useState<number>(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(end);
      return;
    }

    setValue(start);
    startTimeRef.current = null;

    const tick = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(start + (end - start) * ease(progress)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, end, duration, start]);

  return value;
}

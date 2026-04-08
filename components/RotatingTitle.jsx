'use client';
import { useState, useEffect, useRef, memo } from 'react';

const PAUSE_MS = 3500;
const SLIDE_MS = 600;

const RotatingTitle = memo(({ titles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const prevTitlesRef = useRef(titles);

  // Reset on language change
  useEffect(() => {
    if (prevTitlesRef.current !== titles) {
      prevTitlesRef.current = titles;
      setCurrentIndex(0);
      setPhase('idle');
    }
  }, [titles]);

  // Phase machine
  useEffect(() => {
    if (!Array.isArray(titles) || titles.length <= 1) return;

    let timer;
    switch (phase) {
      case 'idle':
        timer = setTimeout(() => setPhase('exiting'), PAUSE_MS);
        break;
      case 'exiting':
        timer = setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % titles.length);
          setPhase('entering');
        }, SLIDE_MS);
        break;
      case 'entering':
        timer = setTimeout(() => setPhase('idle'), SLIDE_MS);
        break;
    }
    return () => clearTimeout(timer);
  }, [phase, titles]);

  // Fallback for non-array
  if (!Array.isArray(titles)) {
    return (
      <h1 className="hero-title text-black dark:text-white mb-8">
        {titles}
      </h1>
    );
  }

  const displayedTitle = titles[currentIndex] || titles[0];
  const lines = displayedTitle.split('\n');

  return (
    <div className="overflow-hidden w-full">
      <h1
        className={`hero-title text-black dark:text-white mb-8 rotating-title-${phase}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h1>
    </div>
  );
});

RotatingTitle.displayName = 'RotatingTitle';
export default RotatingTitle;

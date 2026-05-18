'use client';
import { useState, useEffect, useRef, memo } from 'react';

const PAUSE_MS = 3500;
const SLIDE_MS = 600;

const RotatingTitle = memo(({ titles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const prevTitlesRef = useRef(titles);

  // Reset on language change
  useEffect(() => {
    if (prevTitlesRef.current !== titles) {
      prevTitlesRef.current = titles;
      setCurrentIndex(0);
      setPrevIndex(0);
      setPhase('idle');
    }
  }, [titles]);

  // Phase machine — single transition phase that overlaps leaving + incoming
  useEffect(() => {
    if (!Array.isArray(titles) || titles.length <= 1) return;

    let timer;
    if (phase === 'idle') {
      timer = setTimeout(() => {
        setPrevIndex(currentIndex);
        setCurrentIndex((prev) => (prev + 1) % titles.length);
        setPhase('transitioning');
      }, PAUSE_MS);
    } else if (phase === 'transitioning') {
      timer = setTimeout(() => setPhase('idle'), SLIDE_MS);
    }
    return () => clearTimeout(timer);
  }, [phase, titles, currentIndex]);

  // Fallback for non-array
  if (!Array.isArray(titles)) {
    return (
      <h1 className="hero-title text-display text-black dark:text-white mb-8">
        {titles}
      </h1>
    );
  }

  const renderLines = (text) => {
    const lines = (text || '').split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  const incomingTitle = titles[currentIndex] || titles[0];
  const leavingTitle = titles[prevIndex] || titles[0];
  const isTransitioning = phase === 'transitioning';

  return (
    <div className="rotating-title-stack overflow-hidden w-full">
      {isTransitioning && (
        <h1
          className="hero-title text-display text-black dark:text-white mb-8 rotating-title-leaving"
          aria-hidden="true"
        >
          {renderLines(leavingTitle)}
        </h1>
      )}
      <h1
        className={`hero-title text-display text-black dark:text-white mb-8 ${isTransitioning ? 'rotating-title-incoming' : 'rotating-title-idle'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {renderLines(incomingTitle)}
      </h1>
    </div>
  );
});

RotatingTitle.displayName = 'RotatingTitle';
export default RotatingTitle;

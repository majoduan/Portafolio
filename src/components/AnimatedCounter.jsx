import { useState, useEffect, memo } from 'react';

const AnimatedCounter = memo(({ value, duration = 1800, isTransitioning }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isTransitioning) {
      setCount(0);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function para suavidad
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isTransitioning]);

  return <>{count}</>;
});

AnimatedCounter.displayName = 'AnimatedCounter';

export default AnimatedCounter;

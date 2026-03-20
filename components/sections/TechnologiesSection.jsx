'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';
import TechCard from '../TechCard';
import { getTechnologies } from '../../data/technologies';
import { useTranslation } from '../../hooks/useTranslation';

const TechnologiesSection = React.memo(() => {
  const { t } = useTranslation();

  // All tech-related state
  const [activeTab, setActiveTab] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isTechCardHovered, setIsTechCardHovered] = useState(false);
  const [lastManualChange, setLastManualChange] = useState(0);
  const [currentTechTab, setCurrentTechTab] = useState(0);
  const [previousTechTab, setPreviousTechTab] = useState(null);
  const [techTransitionState, setTechTransitionState] = useState('idle'); // 'idle', 'exiting', 'entering'
  const [containerHeight, setContainerHeight] = useState('auto');

  // Refs
  const techContainerRef = useRef(null);
  const cachedHeights = useRef({});

  // Memoized data
  const technologies = useMemo(() => getTechnologies(t), [t]);

  const techCategories = useMemo(() => [
    {
      id: "backend",
      title: t('technologies.categories.backend.title'),
      shortTitle: t('technologies.categories.backend.short')
    },
    {
      id: "frontend",
      title: t('technologies.categories.frontend.title'),
      shortTitle: t('technologies.categories.frontend.short')
    },
    {
      id: "databases",
      title: t('technologies.categories.databases.title'),
      shortTitle: t('technologies.categories.databases.short')
    },
    {
      id: "devops",
      title: t('technologies.categories.devops.title'),
      shortTitle: t('technologies.categories.devops.short')
    }
  ], [t]);

  // Manual tab change handler
  const handleManualTabChange = useCallback((index) => {
    setActiveTab(index);
    setLastManualChange(Date.now());
  }, []);

  // Auto-rotate tech categories
  useEffect(() => {
    if (!isManuallyPaused && !isTechCardHovered) {
      const interval = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % techCategories.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isManuallyPaused, isTechCardHovered, lastManualChange, techCategories.length]);

  // State machine for tech transitions
  useEffect(() => {
    if (activeTab === currentTechTab) return;

    // Phase 1: Start exit
    setTechTransitionState('exiting');
    setPreviousTechTab(currentTechTab);

    // Phase 2: After 1000ms, switch content and prepare entry
    const exitTimer = setTimeout(() => {
      setCurrentTechTab(activeTab);
      setTechTransitionState('entering');

      // Phase 3: After 100ms, mark as idle
      const enterTimer = setTimeout(() => {
        setTechTransitionState('idle');
        setPreviousTechTab(null);
      }, 100);

      return () => clearTimeout(enterTimer);
    }, 1000);

    return () => clearTimeout(exitTimer);
  }, [activeTab, currentTechTab]);

  // Calculate and cache tech container height
  useEffect(() => {
    if (!techContainerRef.current || techTransitionState !== 'idle') return;

    const categoryId = techCategories[currentTechTab].id;

    // Use cached height if available
    if (cachedHeights.current[categoryId]) {
      setContainerHeight(cachedHeights.current[categoryId]);
      return;
    }

    // Calculate height only the first time for this category
    const measureHeight = () => {
      const grid = techContainerRef.current?.querySelector('.tech-cards-grid');
      if (grid) {
        const height = grid.offsetHeight;
        cachedHeights.current[categoryId] = height;
        setContainerHeight(height);
      }
    };

    const rafId = requestAnimationFrame(() => {
      setTimeout(measureHeight, 150);
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentTechTab, techTransitionState, techCategories]);

  // Recalculate heights on resize (clear cache and recalculate)
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cachedHeights.current = {};

        if (techContainerRef.current && techTransitionState === 'idle') {
          const grid = techContainerRef.current.querySelector('.tech-cards-grid');
          if (grid) {
            const height = grid.offsetHeight;
            const categoryId = techCategories[currentTechTab].id;
            cachedHeights.current[categoryId] = height;
            setContainerHeight(height);
          }
        }
      }, 300);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [currentTechTab, techTransitionState, techCategories]);

  return (
    <section id="technologies" className="pt-20 relative z-10 bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
          {t('technologies.title')}
        </h2>
        {/* Tab Navigation Bar - Estilo Facebook */}
        <div className="relative flex justify-center mb-12 border-b border-slate-300 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex gap-1 md:gap-2 pr-10">
            {techCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleManualTabChange(index)}
                className={`px-2 md:px-6 lg:px-8 py-3 md:py-4 relative transition-all duration-300 text-xs md:text-sm lg:text-base max-[374px]:max-w-[72px] max-[374px]:truncate ${
                  currentTechTab === index
                    ? 'text-black dark:text-white font-bold'
                    : 'text-gray-400 dark:text-gray-400 font-medium group'
                }`}
              >
                {/* Show short title on mobile/tablet, full on desktop */}
                <span className="hidden md:inline">{category.title}</span>
                <span className="inline md:hidden">{category.shortTitle}</span>
                {/* Bottom indicator line with smooth transition */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-1000 ${
                    currentTechTab === index ? 'bg-black dark:bg-white opacity-100 scale-x-100' : 'bg-gray-400 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  }`}
                />
              </button>
            ))}
          </div>
          {/* Pause/Play button */}
          <button
            onClick={() => setIsManuallyPaused((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all duration-300"
            aria-label={isManuallyPaused || isTechCardHovered ? 'Play carousel' : 'Pause carousel'}
          >
            {isManuallyPaused || isTechCardHovered
              ? <Play className="w-3.5 h-3.5" />
              : <Pause className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Technology Cards Container with dynamic height */}
        <div
          ref={techContainerRef}
          className="tech-cards-container"
          style={{ height: containerHeight }}
        >
          {/* Previous tab cards (exiting) */}
          {techTransitionState === 'exiting' && previousTechTab !== null && (
            <div className="tech-cards-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {technologies[techCategories[previousTechTab].id].map((tech, index) => (
                <TechCard
                  key={`exiting-${previousTechTab}-${tech.name}`}
                  tech={tech}
                  index={index}
                  animationState="exiting"
                  onMouseEnter={() => setIsTechCardHovered(true)}
                  onMouseLeave={() => setIsTechCardHovered(false)}
                />
              ))}
            </div>
          )}

          {/* Current tab cards */}
          {(techTransitionState === 'entering' || techTransitionState === 'idle') && (
            <div className="tech-cards-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {technologies[techCategories[currentTechTab].id].map((tech, index) => (
                <TechCard
                  key={`current-${currentTechTab}-${tech.name}`}
                  tech={tech}
                  index={index}
                  animationState={techTransitionState}
                  onMouseEnter={() => setIsTechCardHovered(true)}
                  onMouseLeave={() => setIsTechCardHovered(false)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

TechnologiesSection.displayName = 'TechnologiesSection';

export default TechnologiesSection;

'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';
import TechCard from '../TechCard';
import { getTechnologies } from '../../data/technologies';
import { useTranslation } from '../../hooks/useTranslation';

// Animation timing constants
const ANIM_DURATION = 700;          // ms per card animation
const STAGGER_DESKTOP = 100;        // ms between each card (desktop)
const STAGGER_MOBILE = 70;          // ms between each card (mobile)
const ANIM_BUFFER = 80;             // small buffer after last card finishes

const TechnologiesSection = React.memo(() => {
  const { t } = useTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isTechCardHovered, setIsTechCardHovered] = useState(false);
  const [lastManualChange, setLastManualChange] = useState(0);
  const [currentTechTab, setCurrentTechTab] = useState(0);
  const [containerHeight, setContainerHeight] = useState('auto');

  // Crossfade transition state
  const [transition, setTransition] = useState({ phase: 'idle', fromTab: null, toTab: null });

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

  // Detect mobile for stagger calculation
  const isMobileRef = useRef(true);
  useEffect(() => { isMobileRef.current = window.innerWidth < 768; }, []);

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

  // Trigger crossfade when activeTab changes
  useEffect(() => {
    if (activeTab === currentTechTab) return;
    if (transition.phase === 'transitioning') return;
    setTransition({ phase: 'transitioning', fromTab: currentTechTab, toTab: activeTab });
  }, [activeTab, currentTechTab, transition.phase]);

  // Calculated timeout to complete transition (replaces unreliable onAnimationEnd)
  useEffect(() => {
    if (transition.phase !== 'transitioning') return;

    const enteringCards = technologies[techCategories[transition.toTab].id];
    const stagger = isMobileRef.current ? STAGGER_MOBILE : STAGGER_DESKTOP;
    const totalTime = ANIM_DURATION + (enteringCards.length - 1) * stagger + ANIM_BUFFER;

    const timer = setTimeout(() => {
      setCurrentTechTab(transition.toTab);
      setTransition({ phase: 'idle', fromTab: null, toTab: null });
    }, totalTime);

    return () => clearTimeout(timer);
  }, [transition, technologies, techCategories]);

  // Calculate and cache tech container height
  useEffect(() => {
    if (!techContainerRef.current || transition.phase !== 'idle') return;

    const categoryId = techCategories[currentTechTab].id;

    if (cachedHeights.current[categoryId]) {
      setContainerHeight(cachedHeights.current[categoryId]);
      return;
    }

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
  }, [currentTechTab, transition.phase, techCategories]);

  // Recalculate heights on resize
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cachedHeights.current = {};

        if (techContainerRef.current && transition.phase === 'idle') {
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
  }, [currentTechTab, transition.phase, techCategories]);

  // Determine which tab index to show in the tab bar as active
  const displayTab = transition.phase === 'transitioning' ? transition.toTab : currentTechTab;

  return (
    <section id="technologies" className="pt-20 relative z-10 bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
          {t('technologies.title')}
        </h2>
        {/* Tab Navigation Bar */}
        <div className="relative flex justify-center mb-12 border-b border-slate-300 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex gap-1 md:gap-2 pr-10">
            {techCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleManualTabChange(index)}
                className={`px-2 md:px-6 lg:px-8 py-3 md:py-4 relative transition-all duration-300 text-xs md:text-sm lg:text-base max-[374px]:max-w-[72px] max-[374px]:truncate ${
                  displayTab === index
                    ? 'text-black dark:text-white font-bold'
                    : 'text-gray-400 dark:text-gray-400 font-medium group'
                }`}
              >
                <span className="hidden md:inline">{category.title}</span>
                <span className="inline md:hidden">{category.shortTitle}</span>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-1000 ${
                    displayTab === index ? 'bg-black dark:bg-white opacity-100 scale-x-100' : 'bg-gray-400 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
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
          aria-live="polite"
          role="region"
          aria-label={t('technologies.title')}
        >
          {/* Exiting grid (fades out underneath) */}
          {transition.phase === 'transitioning' && transition.fromTab !== null && (
            <div className="tech-cards-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8" style={{ zIndex: 1 }}>
              {technologies[techCategories[transition.fromTab].id].map((tech, index) => (
                <TechCard
                  key={`exit-${transition.fromTab}-${tech.name}`}
                  tech={tech}
                  index={index}
                  animationState="exiting"
                />
              ))}
            </div>
          )}

          {/* Current / entering grid */}
          <div className="tech-cards-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8" style={{ zIndex: 2 }}>
            {technologies[techCategories[
              transition.phase === 'transitioning' ? transition.toTab : currentTechTab
            ].id].map((tech, index) => (
              <TechCard
                key={`current-${transition.phase === 'transitioning' ? transition.toTab : currentTechTab}-${tech.name}`}
                tech={tech}
                index={index}
                animationState={transition.phase === 'transitioning' ? 'entering' : 'idle'}
                onMouseEnter={() => setIsTechCardHovered(true)}
                onMouseLeave={() => setIsTechCardHovered(false)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

TechnologiesSection.displayName = 'TechnologiesSection';

export default TechnologiesSection;

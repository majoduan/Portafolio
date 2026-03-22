'use client';
import React, { useMemo, memo } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TechCard = memo(({ tech, index, isMobile, animationState, onMouseEnter, onMouseLeave }) => {
  const { t } = useTranslation();

  const shapeStyle = useMemo(() => {
    const shapes = [
      { clipPath: 'none', rounded: 'rounded-xl' },
      { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', rounded: '' },
      { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', rounded: '' }
    ];
    const randomIndex = tech.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % shapes.length;
    return shapes[randomIndex];
  }, [tech.name]);

  const IconComponent = useMemo(() => tech.icon, [tech.icon]);

  // CSS animation class — tech-card-idle prevents glitch when entering→idle
  const animationClass =
    animationState === 'entering' ? 'tech-card-entering' :
    animationState === 'exiting' ? 'tech-card-exiting' :
    'tech-card-idle';

  // Animation style with staggered delay
  const animationStyle = animationState !== 'idle' ? {
    animationDelay: `${index * (isMobile ? 70 : 100)}ms`,
    animationDuration: '700ms',
  } : undefined;

  // exp-tag-fill only triggers when idle (after enter animation completes)
  const shouldAnimate = !isMobile && animationState === 'idle';

  // Renderizado móvil compacto
  if (isMobile) {
    return (
      <div
        className={`tech-card group bg-white/80 dark:bg-[var(--bg-elevated-50)] border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-md backdrop-blur-sm ${animationClass}`}
        style={animationStyle}
      >
        <div className="p-3 flex items-center gap-3">
          <div
            className={`w-12 h-12 flex-shrink-0 bg-gradient-to-r ${tech.color} ${shapeStyle.rounded} flex items-center justify-center shadow-md p-2`}
            style={{ clipPath: shapeStyle.clipPath }}
          >
            <IconComponent className="w-full h-full text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {tech.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 truncate">
              {tech.experience}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-[var(--accent-solid-alt)]">
              {tech.level}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado desktop completo
  return (
    <div
      className={`tech-card group bg-white/80 dark:bg-[var(--bg-elevated-50)] border border-slate-200 dark:border-slate-700/50 hover:border-black dark:hover:border-white transition-all duration-300 rounded-lg shadow-md dark:shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-[1.03] ${animationClass}`}
      style={animationStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Left section - 65% */}
          <div className="flex items-center gap-2 lg:gap-4 w-[65%] min-w-0">
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 lg:w-20 h-14 lg:h-20 bg-gradient-to-r ${tech.color} ${shapeStyle.rounded} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-6 group-hover:scale-110 p-2 lg:p-3`}
                style={{ clipPath: shapeStyle.clipPath }}
              >
                <div className="absolute inset-0 bg-white/10" style={{ clipPath: shapeStyle.clipPath }} />
                <IconComponent className="w-full h-full text-white relative z-10" />
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${tech.color} ${shapeStyle.rounded} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm`}
                style={{ clipPath: shapeStyle.clipPath }}
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm lg:text-lg font-bold text-slate-900 dark:text-white transition-colors truncate">
                {tech.name}
              </h4>
              <p className="text-xs lg:text-sm text-slate-600 dark:text-gray-400 transition-colors break-words">
                {tech.description}
              </p>
            </div>
          </div>

          {/* Right section - 35% */}
          <div className="w-[35%] flex justify-end">
            <span className={`relative inline-flex items-center justify-center px-3 lg:px-4 py-1 text-[10px] lg:text-xs font-medium rounded-full whitespace-nowrap overflow-hidden ${
              shouldAnimate ? 'text-black dark:text-white' : ''
            }`}>
              {/* Animated fill background */}
              <span
                className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${tech.tagColor || tech.color} rounded-full ${shouldAnimate ? 'exp-tag-fill' : ''}`}
                style={{ width: shouldAnimate ? '100%' : '0%' }}
              />
              {/* Text content */}
              <span className="relative z-10 text-center">
                <span className="inline lg:hidden xl:inline">{t('techCard.experience')}</span>
                <span className="hidden lg:inline xl:hidden">{t('techCard.experienceShort')}</span>: {tech.experience}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

TechCard.displayName = 'TechCard';

export default TechCard;

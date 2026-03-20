'use client';
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Hook para detectar si es dispositivo móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

const TechCard = memo(({ tech, index, animationState, onMouseEnter, onMouseLeave }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Si está saliendo, comienza visible. Si está entrando, comienza invisible
  const [isVisible, setIsVisible] = useState(animationState === 'exiting');
  
  // Memoizar cálculos que no cambian - optimizado con dependencias específicas
  const shapeStyle = useMemo(() => {
    const shapes = [
      { clipPath: 'none', rounded: 'rounded-xl' },
      { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', rounded: '' },
      { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', rounded: '' }
    ];
    const randomIndex = tech.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % shapes.length;
    return shapes[randomIndex];
  }, [tech.name]);

  // Memoizar el nombre del componente de icono para evitar re-renders
  const IconComponent = useMemo(() => tech.icon, [tech.icon]);

  // Determinar si debe animar (solo desktop, entering o idle)
  const shouldAnimate = !isMobile && (animationState === 'idle' || animationState === 'entering');

  // Forzar la transición al montar el componente
  useEffect(() => {
    if (animationState === 'entering') {
      // Pequeño delay para forzar el reflow y que la transición funcione
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else if (animationState === 'idle') {
      setIsVisible(true);
    } else if (animationState === 'exiting') {
      // Pequeño delay y luego se oculta
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  // Renderizado móvil compacto (optimizado para performance)
  if (isMobile) {
    return (
      <div
        className={`tech-card group bg-white/80 dark:bg-[var(--bg-elevated-50)] border border-slate-200 dark:border-slate-700/50 transition-opacity duration-500 rounded-lg shadow-md backdrop-blur-sm ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionDelay: `${index * 50}ms`
        }}
      >
        <div className="p-3 flex items-center gap-3">
          {/* Icono compacto */}
          <div
            className={`w-12 h-12 flex-shrink-0 bg-gradient-to-r ${tech.color} ${shapeStyle.rounded} flex items-center justify-center shadow-md p-2`}
            style={{ clipPath: shapeStyle.clipPath }}
          >
            <IconComponent className="w-full h-full text-white" />
          </div>
          
          {/* Info compacta */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {tech.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 truncate">
              {tech.experience}
            </p>
          </div>
          
          {/* Solo nivel en móvil */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-[var(--accent-solid-alt)]">
              {tech.level}%
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizado desktop completo (con todas las animaciones)
  return (
    <div
      className={`tech-card group bg-white/80 dark:bg-[var(--bg-elevated-50)] border border-slate-200 dark:border-slate-700/50 hover:border-black dark:hover:border-white transition-all duration-300 rounded-lg shadow-md dark:shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-[1.03] ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        transitionDelay: `${index * 80}ms`
      }}
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

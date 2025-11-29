import { useState, useEffect, useMemo, memo } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { useTranslation } from '../hooks/useTranslation';

// Hook para detectar si es dispositivo móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
  const { experienceYears, dots, shapeStyle, shouldAnimate } = useMemo(() => {
    const years = parseFloat(tech.experience);
    const dotsCount = Math.min(5, Math.ceil(years));
    
    const shapes = [
      { clipPath: 'none', rounded: 'rounded-xl' },
      { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', rounded: '' },
      { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', rounded: '' }
    ];
    const randomIndex = tech.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % shapes.length;
    const shape = shapes[randomIndex];
    
    // En móvil, no animar para mejor performance
    const animate = !isMobile && (animationState === 'idle' || animationState === 'entering');
    
    return {
      experienceYears: years,
      dots: dotsCount,
      shapeStyle: shape,
      shouldAnimate: animate
    };
  }, [tech.name, tech.experience, animationState, isMobile]);

  // Memoizar el nombre del componente de icono para evitar re-renders
  const IconComponent = useMemo(() => tech.icon, [tech.icon]);

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
        className={`tech-card group bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-opacity duration-500 rounded-lg shadow-md backdrop-blur-sm ${
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
            <div className="text-lg font-bold text-red-600 dark:text-purple-400">
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
      className={`tech-card group bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-purple-400/50 dark:hover:border-purple-500/40 transition-all duration-1000 rounded-lg shadow-md dark:shadow-lg hover:shadow-xl backdrop-blur-sm ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        transitionDelay: `${index * 80}ms`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div
              className={`w-20 h-20 bg-gradient-to-r ${tech.color} ${shapeStyle.rounded} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-6 group-hover:scale-110 p-3`}
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

          <div className="flex-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-purple-400 transition-colors">
              {tech.name}
            </h4>
            <p className="text-sm text-slate-600 dark:text-gray-400 transition-colors">
              {tech.description}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-red-600 dark:text-purple-400 transition-colors">
              {shouldAnimate ? <AnimatedCounter value={tech.level} isTransitioning={false} /> : tech.level}%
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500 text-gray-600 transition-colors">
              {tech.experience}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-900 dark:text-gray-300 transition-colors">{t('techCard.masteryLevel')}</span>
            <span className="text-red-600 dark:text-purple-300 font-medium transition-colors">
              {shouldAnimate ? <AnimatedCounter value={tech.level} isTransitioning={false} /> : tech.level}%
            </span>
          </div>
          <div className="w-full bg-slate-700 dark:bg-slate-700 bg-slate-300 rounded-full h-2.5 overflow-hidden transition-colors">
            <div
              className={`h-full bg-gradient-to-r ${tech.color} rounded-full relative ${shouldAnimate ? 'progress-bar-animate' : ''}`}
              style={{
                width: shouldAnimate ? `${tech.level}%` : '0%'
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className={`px-3 py-1 bg-gradient-to-r ${tech.color} bg-opacity-20 text-xs font-medium rounded-full border border-purple-400/20`}>
            {t('techCard.experience')}: {tech.experience}
          </span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < dots ? `bg-gradient-to-r ${tech.color}` : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TechCard.displayName = 'TechCard';

export default TechCard;

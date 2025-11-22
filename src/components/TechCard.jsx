import React, { useState, useEffect, useMemo } from 'react';
import AnimatedCounter from './AnimatedCounter';

const TechCard = React.memo(({ tech, index, animationState, onMouseEnter, onMouseLeave }) => {
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
    
    const animate = animationState === 'idle' || animationState === 'entering';
    
    return {
      experienceYears: years,
      dots: dotsCount,
      shapeStyle: shape,
      shouldAnimate: animate
    };
  }, [tech.name, tech.experience, animationState]);

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

  return (
    <div
      className={`tech-card group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-1000 rounded-lg shadow-sm hover:shadow-xl backdrop-blur-sm ${
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
            <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              {tech.name}
            </h4>
            <p className="text-sm text-gray-400">
              {tech.description}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">
              {shouldAnimate ? <AnimatedCounter value={tech.level} isTransitioning={false} /> : tech.level}%
            </div>
            <div className="text-xs text-gray-500">
              {tech.experience}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Nivel de dominio</span>
            <span className="text-purple-300 font-medium">
              {shouldAnimate ? <AnimatedCounter value={tech.level} isTransitioning={false} /> : tech.level}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
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
            Experiencia: {tech.experience}
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

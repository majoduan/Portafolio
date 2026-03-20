'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, Component } from 'react';
import { Mail, Linkedin, Github, Code } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

// Dynamic import Spline with SSR disabled for Next.js
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

// Error boundary local para Spline - si falla, muestra fallback CSS sin romper la página
class SplineErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const HeroSection = React.memo(({ shouldLoadSpline }) => {
  const { t } = useTranslation();
  const [typewriterText, setTypewriterText] = useState('');
  const splineRef = useRef(null);
  const splineLoadingRef = useRef(false);

  // Texto completo para el efecto typewriter - traducido
  const fullText = useMemo(() => t('hero.description'), [t]);

  // Typewriter effect for hero description
  useEffect(() => {
    // Reset text cuando cambia el idioma
    setTypewriterText('');

    let currentIndex = 0;
    const typingSpeed = 30; // Velocidad de escritura en ms

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypewriterText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [fullText]);

  // Funcion para manejar el evento de carga de Spline - optimizada con prevencion de duplicados
  const onSplineLoad = useCallback((spline) => {
    // Prevenir procesamiento duplicado en React Strict Mode
    if (splineLoadingRef.current) {
      return;
    }

    splineLoadingRef.current = true;
    splineRef.current = spline;
  }, []);

  // Funcion para manejar el movimiento del mouse sobre Spline - optimizada
  const onSplineMouseMove = useCallback(() => {
    // Spline maneja automaticamente el movimiento del mouse si esta configurado en la escena
  }, []);

  // Asegurar que el canvas de Spline capture eventos del mouse
  useEffect(() => {
    const handleSplineInteraction = () => {
      const splineCanvas = document.querySelector('.spline-container canvas');
      if (splineCanvas) {
        splineCanvas.style.pointerEvents = 'auto';
      }
    };

    // Ejecutar despues de que Spline se haya cargado
    const timer = setTimeout(handleSplineInteraction, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-16 bg-transparent transition-colors duration-300 z-10">
      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenido de texto - Izquierda */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
              {t('hero.name')}
            </h1>
            <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-100 mb-6 font-medium transition-colors duration-300">
              {t('hero.title')}
            </p>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-100 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed min-h-[120px] text-justify transition-colors duration-300">
              {typewriterText}
              <span className="animate-pulse">|</span>
            </p>

            {/* Boton CV y Redes Sociales */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <a
                href="/cv/Mateo_Dueñas_CV.pdf"
                download="Mateo_Dueñas_CV.pdf"
                className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                {t('hero.downloadCV')}
              </a>

              {/* Iconos sociales */}
              <div className="flex gap-3">
                <a
                  href="https://www.linkedin.com/in/mateo-dueñas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://github.com/mateo-dueñas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Github className="w-5 h-5 text-white" />
                </a>
                <a
                  href="mailto:mateo.duenas@epn.edu.ec"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Estadisticas */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-300 dark:border-white/10 transition-colors duration-300">
              {[
                { value: '2+', label: t('hero.stats.experience') },
                { value: '15+', label: t('hero.stats.projects') },
                { value: '20+', label: t('hero.stats.technologies') }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animacion 3D de Spline - Desktop/tablet only, fallback CSS en movil */}
          <div className="relative h-[400px] lg:h-[600px] w-full overflow-hidden rounded-2xl mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
            {shouldLoadSpline ? (
              <SplineErrorBoundary fallback={
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code className="w-16 h-16 text-blue-400/50" />
                  </div>
                </div>
              }>
                <div className="relative spline-container">
                  <div className="w-[120%] h-[120%] -mt-[10%] -ml-[10%] -mb-[10%] -mr-[10%]">
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    }>
                      <Spline
                        key="spline-scene"
                        scene="https://prod.spline.design/CTzlK88G4nA0eFUO/scene.splinecode"
                        onLoad={onSplineLoad}
                        onMouseMove={onSplineMouseMove}
                        className="w-full h-full"
                      />
                    </Suspense>
                  </div>
                </div>
              </SplineErrorBoundary>
            ) : (
              /* Fallback visual CSS puro para movil (0KB JS extra) */
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code className="w-16 h-16 text-blue-400/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

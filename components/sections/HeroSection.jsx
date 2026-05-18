'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback, useContext, Suspense, Component } from 'react';
import { Mail, Linkedin, Github, Briefcase, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useReversibleInView } from '../../hooks/useReversibleInView';
import { useCountUp } from '../../hooks/useCountUp';
import { AppContext } from '../../contexts/AppContext';

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

function StatNumber({ target, suffix, label }) {
  const ref = useRef(null);
  const inView = useReversibleInView(ref, { threshold: 0.4, rootMargin: '0px' });
  const value = useCountUp({ end: target, duration: 1800, enabled: inView });

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-black dark:text-white tabular-nums">
        {value}{suffix}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">
        {label}
      </div>
    </div>
  );
}

const HeroSection = React.memo(({ shouldLoadSpline }) => {
  const { t } = useTranslation();
  const { theme } = useContext(AppContext);
  const [typewriterText, setTypewriterText] = useState('');
  const [isSplineReady, setIsSplineReady] = useState(false);
  const [cvDownloaded, setCvDownloaded] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const heroSectionRef = useRef(null);
  const cvFeedbackTimer = useRef(null);
  const splineRef = useRef(null);
  const splineLoadingRef = useRef(false);
  const themeRef = useRef(theme);

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

  // Mantener themeRef sincronizado
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Helper: emitir eventos de teclado reales para Spline
  const dispatchKeyboardEvent = useCallback((eventType, key = '0') => {
    const event = new KeyboardEvent(eventType, {
      key,
      code: key === '0' ? 'Digit0' : key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }, []);

  // Funcion para manejar el evento de carga de Spline
  const onSplineLoad = useCallback((spline) => {
    if (splineLoadingRef.current) return;
    splineLoadingRef.current = true;
    splineRef.current = spline;

    // Solo marcar que Spline está listo - el tema se aplica en el useEffect
    setIsSplineReady(true);
  }, []);

  // Aplicar tema SIEMPRE que Spline esté listo y el tema cambie
  // Esto garantiza que funcione en mount inicial, cambios de tema y re-navegaciones
  useEffect(() => {
    if (!isSplineReady || !splineRef.current) return;

    if (theme === 'light') {
      dispatchKeyboardEvent('keydown', '0');
    } else {
      dispatchKeyboardEvent('keyup', '0');
    }
  }, [theme, isSplineReady, dispatchKeyboardEvent]);

  // Limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      splineLoadingRef.current = false;
      splineRef.current = null;
      setIsSplineReady(false);
    };
  }, []);

  // CV download feedback: muestra checkmark por 1.5s tras click
  const onCvDownload = useCallback(() => {
    setCvDownloaded(true);
    if (cvFeedbackTimer.current) clearTimeout(cvFeedbackTimer.current);
    cvFeedbackTimer.current = setTimeout(() => setCvDownloaded(false), 1500);
  }, []);

  // Cleanup del timer de feedback
  useEffect(() => () => {
    if (cvFeedbackTimer.current) clearTimeout(cvFeedbackTimer.current);
  }, []);

  // Pausar el painting del canvas Spline cuando hero esta fuera del viewport.
  // Usamos content-visibility: hidden (W3C) via clase CSS toggleada por
  // IntersectionObserver. El browser pausa style/layout/paint del subtree,
  // lo cual libera el GPU/CPU mientras el usuario scrollea por otras secciones.
  // rootMargin negativo para que se pause un poco antes de salir totalmente.
  useEffect(() => {
    if (!shouldLoadSpline) return;
    const section = heroSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '50px 0px 50px 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoadSpline]);

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
    <section ref={heroSectionRef} id="home" className="min-h-screen flex items-center justify-center relative pt-4 md:pt-16 bg-transparent transition-colors duration-300 z-10">
      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Contenido de texto - Izquierda */}
          <div className="text-center lg:text-left">
            <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-100 mb-2 font-medium transition-colors duration-300">
              {t('hero.name')}
            </p>
            <h1 className="hero-title text-display text-black dark:text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-body-lg text-slate-600 dark:text-slate-100 max-w-prose mx-auto lg:mx-0 mb-8 min-h-[80px] text-pretty hyphens-auto transition-colors duration-300">
              {typewriterText}
              <span className="animate-pulse">|</span>
            </p>

            {/* Boton CV y Redes Sociales */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 max-[424px]:flex-col">
              <a
                href="/docs/Mateo_Duenas_CV.pdf"
                download="Mateo_Dueñas_CV.pdf"
                className="swap-btn"
                onClick={onCvDownload}
                aria-label={cvDownloaded ? 'CV downloaded' : t('hero.downloadCV')}
                ref={(el) => {
                  if (el) {
                    const text = el.querySelector('.swap-btn-text');
                    if (text) el.style.setProperty('--swap-text-w', `${text.offsetWidth}px`);
                    el.style.setProperty('--swap-btn-w', `${el.offsetWidth}px`);
                  }
                }}
              >
                <span className="swap-btn-bg" />
                <span className="swap-btn-icon">
                  {cvDownloaded ? (
                    <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-white" aria-hidden="true" />
                  )}
                </span>
                <span className="swap-btn-text">
                  {t('hero.downloadCV')}
                </span>
              </a>

              {/* Iconos sociales — ocultos en mobile (los hay en el footer) */}
              <div className="hidden md:flex gap-3">
                <a
                  href="https://www.linkedin.com/in/mateodue/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Linkedin className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
                <a
                  href="https://github.com/mateo-dueñas"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Github className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
                <a
                  href="mailto:mateo.duenas@epn.edu.ec"
                  aria-label="Email Mateo"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Mail className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Estadisticas */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-300 dark:border-white/10 transition-colors duration-300">
              {[
                { target: 2, suffix: '+', label: t('hero.stats.experience') },
                { target: 15, suffix: '+', label: t('hero.stats.projects') },
                { target: 30, suffix: '+', label: t('hero.stats.technologies') }
              ].map((stat, i) => (
                <StatNumber key={i} target={stat.target} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </div>

          {/* Animacion 3D de Spline - md+ (tablet/desktop).
              Sin fallback visual: si Spline falla o estamos en mobile, no aparece nada.
              `hidden md:block`: oculto en mobile (<768) -> sin aire vacio.
              Sin altura fija: .spline-container interno usa aspect-ratio 1/1. */}
          {shouldLoadSpline && (
            <div className={`hidden md:block relative w-full overflow-hidden rounded-2xl${isHeroInView ? '' : ' spline-paused'}`}>
              <SplineErrorBoundary fallback={null}>
                <div className="relative spline-container">
                  <div className="w-[120%] h-[120%] -mt-[10%] -ml-[10%] -mb-[10%] -mr-[10%]">
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black/40 dark:border-white/40" aria-label="Loading 3D scene" role="status"></div>
                      </div>
                    }>
                      <Spline
                        key="spline-scene"
                        scene="https://prod.spline.design/CTzlK88G4nA0eFUO/scene.splinecode"
                        onLoad={onSplineLoad}
                        className="w-full h-full"
                      />
                    </Suspense>
                  </div>
                </div>
              </SplineErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

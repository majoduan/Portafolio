'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import { Mail, Linkedin, Github, Briefcase, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useReversibleInView } from '../../hooks/useReversibleInView';
import { useCountUp } from '../../hooks/useCountUp';
import { useBootDone } from '../../hooks/useBootDone';
import { AppContext } from '../../contexts/AppContext';
import GalaxyFallback from '../GalaxyFallback';
import TypefaceTitle from '../TypefaceTitle';
import SplineScene from './SplineScene';
import { SOCIAL, CV } from '../../data/social';
import { getScenePolicy } from '../../lib/scenePolicy';

const TYPING_MS = 30;

function StatNumber({ target, suffix, label, enabled }) {
  const ref = useRef(null);
  const inView = useReversibleInView(ref, { threshold: 0.4, rootMargin: '0px' });
  const value = useCountUp({ end: target, duration: 1800, enabled: inView && enabled });

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

// Typewriter sin estado React: escribe directamente en el nodo de texto.
// Antes: setState cada 30 ms durante ~4 s => ~130 re-renders del hero justo
// cuando la escena 3D se parseaba. El SSR incluye el texto completo (SEO);
// `active` (boot terminado) dispara la escritura.
function Typewriter({ text, active }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    if (reduced) { el.textContent = text; return; }

    // Reservar la altura del párrafo completo antes de vaciarlo: escribir letra
    // a letra hacía crecer el <p> línea a línea y empujaba estadísticas y
    // botones (CLS 0,10 medido solo por esto). Con la altura fijada, nada se mueve.
    const parent = el.parentElement;
    el.textContent = text;
    if (parent) parent.style.minHeight = `${parent.offsetHeight}px`;

    el.textContent = '';
    let i = 0;
    let last = 0;
    let raf = 0;
    const step = (now) => {
      if (!last) last = now;
      while (now - last >= TYPING_MS && i < text.length) {
        last += TYPING_MS;
        i++;
        el.textContent = text.slice(0, i);
      }
      if (i < text.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, active]);

  return <span ref={ref}>{text}</span>;
}

const HeroSection = React.memo(({ shouldLoadSpline }) => {
  const { t } = useTranslation();
  const { theme } = useContext(AppContext);
  const bootDone = useBootDone();
  const [cvDownloaded, setCvDownloaded] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [sceneMode, setSceneMode] = useState('galaxy'); // 'galaxy' | 'spline' (decidido en cliente)
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const heroSectionRef = useRef(null);
  const cvFeedbackTimer = useRef(null);
  const splineRef = useRef(null);

  const fullText = useMemo(() => t('hero.description'), [t]);

  // Política de escena (red, memoria, CPU, WebGL, historial) — solo cliente
  useEffect(() => {
    if (!shouldLoadSpline) return;
    setSceneMode(getScenePolicy());
  }, [shouldLoadSpline]);

  // Helper: emitir eventos de teclado reales para Spline (la escena cambia de
  // tema con la tecla 0; keydown = claro, keyup = oscuro)
  const dispatchKeyboardEvent = useCallback((eventType, key = '0') => {
    const event = new KeyboardEvent(eventType, {
      key,
      code: key === '0' ? 'Digit0' : key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }, []);

  const onSplineLoad = useCallback((app) => {
    splineRef.current = app;
    setSceneReady(true);
  }, []);

  const onSplineError = useCallback(() => {
    splineRef.current = null;
    setSceneFailed(true);
  }, []);

  // Aplicar tema siempre que la escena esté lista y el tema cambie
  useEffect(() => {
    if (!sceneReady || !splineRef.current) return;
    if (theme === 'light') dispatchKeyboardEvent('keydown', '0');
    else dispatchKeyboardEvent('keyup', '0');
  }, [theme, sceneReady, dispatchKeyboardEvent]);

  // CV download feedback: muestra checkmark por 1.5s tras click
  const onCvDownload = useCallback(() => {
    setCvDownloaded(true);
    if (cvFeedbackTimer.current) clearTimeout(cvFeedbackTimer.current);
    cvFeedbackTimer.current = setTimeout(() => setCvDownloaded(false), 1500);
  }, []);

  useEffect(() => () => {
    if (cvFeedbackTimer.current) clearTimeout(cvFeedbackTimer.current);
  }, []);

  // Pausar la escena (paint vía content-visibility + bucle del runtime vía
  // stop()/play()) cuando el hero sale del viewport o la pestaña se oculta.
  useEffect(() => {
    if (!shouldLoadSpline) return;
    const section = heroSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '50px 0px 50px 0px' }
    );
    observer.observe(section);
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [shouldLoadSpline]);

  const showSpline = sceneMode === 'spline' && !sceneFailed;

  return (
    <section ref={heroSectionRef} id="home" className="min-h-screen flex items-center justify-center relative pt-4 md:pt-16 bg-transparent z-10">
      <div className="container-page w-full relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Contenido de texto - Izquierda */}
          <div className="text-center lg:text-left">
            <p className="text-2xl md:text-3xl text-black dark:text-slate-100 mb-2 font-medium transition-colors duration-300">
              {t('hero.name')}
            </p>
            <TypefaceTitle
              text={t('hero.title')}
              className="hero-title text-display text-black dark:text-white mb-6"
              enabled={bootDone}
            />
            <p className="text-body-lg text-slate-600 dark:text-slate-100 max-w-prose mx-auto lg:mx-0 mb-8 min-h-[80px] text-pretty hyphens-auto transition-colors duration-300">
              <Typewriter text={fullText} active={bootDone} />
              <span className="animate-pulse">|</span>
            </p>

            {/* Boton CV y Redes Sociales */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 max-[424px]:flex-col">
              <a
                href={CV.href}
                download={CV.downloadName}
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
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Linkedin className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
                <a
                  href={SOCIAL.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Github className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
                <a
                  href={`mailto:${SOCIAL.email}`}
                  aria-label="Email Mateo"
                  className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
                >
                  <Mail className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Estadisticas */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { target: 2, suffix: '+', label: t('hero.stats.experience') },
                { target: 15, suffix: '+', label: t('hero.stats.projects') },
                { target: 30, suffix: '+', label: t('hero.stats.technologies') }
              ].map((stat, i) => (
                <StatNumber key={i} target={stat.target} suffix={stat.suffix} label={stat.label} enabled={bootDone} />
              ))}
            </div>
          </div>

          {/* Animación 3D — md+ (tablet/desktop).
              La galaxia SVG es el estado INICIAL visible (sin spinner); la escena
              Spline se monta encima con opacidad 0 y se funde al estar lista.
              Si la política decide 'galaxy' (red lenta, saveData, equipo débil)
              o la escena falla, la galaxia se queda. En mobile (<768) no hay nada.
              Sin altura fija: .spline-container usa aspect-ratio 1/1. */}
          {shouldLoadSpline && (
            <div className={`hidden md:block relative w-full overflow-hidden rounded-2xl${isHeroInView ? '' : ' spline-paused'}`}>
              <div className="relative spline-container">
                <div
                  className={`hero-galaxy absolute inset-0${sceneReady ? ' hero-galaxy--hidden' : ''}`}
                  aria-hidden={sceneReady ? 'true' : undefined}
                >
                  <GalaxyFallback />
                </div>
                {showSpline && (
                  <div className={`absolute inset-0 transition-opacity duration-700 ease-out ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-[120%] h-[120%] -mt-[10%] -ml-[10%] -mb-[10%] -mr-[10%]">
                      <SplineScene
                        onLoad={onSplineLoad}
                        onError={onSplineError}
                        paused={!isHeroInView || tabHidden}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

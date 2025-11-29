import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, useContext } from 'react';
import { Mail, Linkedin, Github, ExternalLink, Menu, X, Code, Home, Cpu, Award, Briefcase, MessageCircle, Sun, Moon, Languages } from 'lucide-react';
import TechCard from './components/TechCard';
import HUDBootScreen from './components/HUDBootScreen';
import LanguageToggle from './components/LanguageToggle';
import ThemeToggle from './components/ThemeToggle';
import { getTechnologies } from './data/technologies';
import { getProjectsData, getCertificatesData } from './data/projectTranslations';
import { useTranslation } from './hooks/useTranslation';
import { AppContext } from './contexts/AppContext';
import { preloadCriticalResources } from './utils/preloadResources';

// Lazy load Spline para mejorar el tiempo de carga inicial
const Spline = lazy(() => import('@splinetool/react-spline'));

// Lazy load ContactForm para reducir bundle inicial (-20 KB)
const ContactForm = lazy(() => import('./components/ContactForm'));

// Hook personalizado para Intersection Observer (lazy loading inteligente)
const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasIntersected) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        setHasIntersected(true);
      }
    }, { threshold: 0.1, rootMargin: '50px', ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

const Portfolio = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateScrollPosition, setCertificateScrollPosition] = useState(0);
  const [isCertificateCarouselPaused, setIsCertificateCarouselPaused] = useState(false);
  const [isTechCardHovered, setIsTechCardHovered] = useState(false); // Nuevo estado para detectar hover en cards
  const [lastManualChange, setLastManualChange] = useState(0); // Timestamp del último cambio manual
  const [activeSection, setActiveSection] = useState('home'); // Estado para la sección activa
  const [hoveredProject, setHoveredProject] = useState(null); // Estado para precargar video en hover
  const videoPreloadCache = useRef(new Set()); // Cache de videos precargados
  const splineLoadingRef = useRef(false); // Prevenir carga duplicada de Spline

  // Estados para manejar la transición de tecnologías
  const [currentTechTab, setCurrentTechTab] = useState(0);
  const [previousTechTab, setPreviousTechTab] = useState(null);
  const [techTransitionState, setTechTransitionState] = useState('idle'); // 'idle', 'exiting', 'entering'
  
  // Estado para altura dinámica del contenedor de tecnologías
  const [containerHeight, setContainerHeight] = useState('auto');
  
  // Get translated data - memoized to prevent recreation on every render
  const technologies = useMemo(() => getTechnologies(t), [t]);
  const projects = useMemo(() => getProjectsData(t), [t]);
  const certificates = useMemo(() => getCertificatesData(t), [t]);

  const canvasRef = useRef(null);
  const particles = useRef([]);
  const splineRef = useRef(null);
  const certificateContainerRef = useRef(null);
  const techContainerRef = useRef(null);
  const cachedHeights = useRef({}); // Cache de alturas por categoría
  const projectsSectionRef = useRef(null);
  
  // Usar intersection observer para cargar videos solo cuando sean visibles
  const { hasIntersected: projectsVisible } = useIntersectionObserver(projectsSectionRef);

  // Función para precargar video cuando se hace hover - optimizada con useCallback
  const preloadVideoOnHover = useCallback((videoSrc) => {
    // Evitar recargas si ya está en cache
    if (videoPreloadCache.current.has(videoSrc)) return;

    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = videoSrc;
    video.muted = true;
    
    // Marcar como precargado
    videoPreloadCache.current.add(videoSrc);
    
    console.log(`[Preload] Video precargado: ${videoSrc}`);
  }, []);

  // Texto completo para el efecto typewriter - traducido
  const fullText = useMemo(() => t('hero.description'), [t]);

  // Función para manejar el evento de carga de Spline - optimizada con prevención de duplicados
  const onSplineLoad = useCallback((spline) => {
    // Prevenir procesamiento duplicado en React Strict Mode
    if (splineLoadingRef.current) {
      console.log('⚠️ Spline ya cargado, ignorando duplicado (React Strict Mode)');
      return;
    }
    
    splineLoadingRef.current = true;
    splineRef.current = spline;
    console.log('✅ Spline cargado correctamente');
  }, []);

  // Función para manejar el movimiento del mouse sobre Spline - optimizada
  const onSplineMouseMove = useCallback((e) => {
    if (splineRef.current) {
      // Spline maneja automáticamente el movimiento del mouse si está configurado en la escena
      // La escena debe tener la configuración de seguimiento de mouse habilitada
    }
  }, []);

  // Función para manejar cambios manuales de tab - optimizada con useCallback
  const handleManualTabChange = useCallback((index) => {
    setActiveTab(index);
    setLastManualChange(Date.now()); // Actualizar timestamp para reiniciar el temporizador
  }, []);

  // Asegurar que el canvas de Spline capture eventos del mouse
  useEffect(() => {
    const handleSplineInteraction = () => {
      const splineCanvas = document.querySelector('.spline-container canvas');
      if (splineCanvas) {
        splineCanvas.style.pointerEvents = 'auto';
        console.log('Canvas de Spline configurado para interacción');
      }
    };

    // Ejecutar después de que Spline se haya cargado
    const timer = setTimeout(handleSplineInteraction, 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Technology categories with detailed skill data - memoizado y traducido
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

  // Typewriter effect for hero description
  useEffect(() => {
    if (loading) return;

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
  }, [loading, fullText]);

  // Particle system ULTRA-OPTIMIZADO
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reducir partículas: 8 en móvil, 20 en desktop
    const particleCount = window.innerWidth < 768 ? 8 : 20;
    const maxDistance = 80;
    const maxDistanceSq = maxDistance * maxDistance;
    
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }));

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId;
    let frameCount = 0;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      frameCount++;
      const isDark = theme === 'dark';
      
      // Fondo según tema
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.1)' : 'rgba(248, 250, 252, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const particlesArray = particles.current;
      const len = particlesArray.length;
      
      // Colores precalculados según tema
      const particleColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(51, 65, 85, ';
      const lineColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(51, 65, 85, ';
      const opacityMultiplier = isDark ? 1 : 0.8;

      for (let i = 0; i < len; i++) {
        const p = particlesArray[i];
        
        // Mouse interaction solo cada 3 frames
        if (frameCount % 3 === 0) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 10000) { // 100px squared
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100;
            p.vx -= (dx / dist) * force * 0.2;
            p.vy -= (dy / dist) * force * 0.2;
          }
        }

        // Actualizar posición
        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundary check optimizado
        p.vx = (p.x < 0 || p.x > canvasWidth) ? -p.vx : p.vx;
        p.vy = (p.y < 0 || p.y > canvasHeight) ? -p.vy : p.vy;

        // Dibujar partícula (fillRect es más rápido que arc)
        ctx.fillStyle = `${particleColor}${p.opacity * opacityMultiplier})`;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }

      // Conectar partículas solo cada 2 frames
      if (frameCount % 2 === 0) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < len; i++) {
          const p1 = particlesArray[i];
          for (let j = i + 1; j < len; j++) {
            const p2 = particlesArray[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistanceSq) {
              const dist = Math.sqrt(distSq);
              const opacity = (isDark ? 0.1 : 0.15) * (1 - dist / maxDistance);
              ctx.strokeStyle = `${lineColor}${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [loading, theme]);

  // Auto-rotate tech categories
  useEffect(() => {
    if (!loading && !isCarouselPaused && !isTechCardHovered) {
      const interval = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % techCategories.length);
      }, 7000); // Tiempo de visualización
      return () => clearInterval(interval);
    }
  }, [loading, isCarouselPaused, isTechCardHovered, lastManualChange]); // Agregamos lastManualChange como dependencia para reiniciar el intervalo

  // Máquina de estados para transiciones de tecnologías
  useEffect(() => {
    if (activeTab === currentTechTab) return;

    // Fase 1: Comenzar salida (exiting)
    setTechTransitionState('exiting');
    setPreviousTechTab(currentTechTab);

    // Fase 2: Después de 1000ms (tiempo de la transición), cambiar contenido y preparar entrada
    const exitTimer = setTimeout(() => {
      setCurrentTechTab(activeTab);
      setTechTransitionState('entering');

      // Fase 3: Después de 100ms, marcar como idle
      const enterTimer = setTimeout(() => {
        setTechTransitionState('idle');
        setPreviousTechTab(null);
      }, 100);

      return () => clearTimeout(enterTimer);
    }, 1000);

    return () => clearTimeout(exitTimer);
  }, [activeTab, currentTechTab]);

  // Calcular y cachear altura del contenedor de tecnologías
  useEffect(() => {
    if (!techContainerRef.current || techTransitionState !== 'idle') return;
    
    const categoryId = techCategories[currentTechTab].id;
    
    // Si ya tenemos la altura cacheada, usarla
    if (cachedHeights.current[categoryId]) {
      setContainerHeight(cachedHeights.current[categoryId]);
      return;
    }
    
    // Calcular altura solo la primera vez para esta categoría
    const measureHeight = () => {
      const grid = techContainerRef.current?.querySelector('.tech-cards-grid');
      if (grid) {
        const height = grid.offsetHeight;
        cachedHeights.current[categoryId] = height;
        setContainerHeight(height);
      }
    };
    
    // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
    const rafId = requestAnimationFrame(() => {
      // Pequeño delay adicional para asegurar que las animaciones de entrada hayan comenzado
      setTimeout(measureHeight, 150);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [currentTechTab, techTransitionState, techCategories]);

  // Recalcular alturas en resize (limpiar cache y recalcular)
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      // Limpiar el cache cuando cambia el tamaño de ventana
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cachedHeights.current = {};
        
        // Recalcular altura actual
        if (techContainerRef.current && techTransitionState === 'idle') {
          const grid = techContainerRef.current.querySelector('.tech-cards-grid');
          if (grid) {
            const height = grid.offsetHeight;
            const categoryId = techCategories[currentTechTab].id;
            cachedHeights.current[categoryId] = height;
            setContainerHeight(height);
          }
        }
      }, 300); // Debounce de 300ms
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [currentTechTab, techTransitionState, techCategories]);

  // Auto-scroll certificates carousel - optimizado con requestAnimationFrame
  useEffect(() => {
    if (!loading && !isCertificateCarouselPaused && certificateContainerRef.current) {
      let animationFrameId;
      let lastTime = 0;

      const animate = (currentTime) => {
        if (currentTime - lastTime >= 16) { // ~60fps
          setCertificateScrollPosition((prev) => {
            const container = certificateContainerRef.current;
            if (container) {
              const maxScroll = container.scrollWidth - container.clientWidth;
              const newPosition = prev + 0.5;

              if (newPosition >= maxScroll / 3) {
                return 0;
              }
              return newPosition;
            }
            return prev;
          });
          lastTime = currentTime;
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [loading, isCertificateCarouselPaused]);

  // Apply scroll position to container
  useEffect(() => {
    if (certificateContainerRef.current) {
      certificateContainerRef.current.scrollLeft = certificateScrollPosition;
    }
  }, [certificateScrollPosition]);

  // Detect active section on scroll - optimizado con throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['home', 'technologies', 'certificates', 'projects', 'contact'];
          const scrollPosition = window.scrollY + 150;
          
          if (window.scrollY < 100) {
            setActiveSection('home');
            ticking = false;
            return;
          }
          
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isAtBottom = windowHeight + window.scrollY >= documentHeight - 50;
          
          if (isAtBottom) {
            setActiveSection('contact');
            ticking = false;
            return;
          }

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const element = document.getElementById(section);
            if (element) {
              const { offsetTop } = element;
              if (scrollPosition >= offsetTop) {
                setActiveSection(section);
                break;
              }
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <HUDBootScreen onComplete={() => {
      setLoading(false);
      // Precargar recursos críticos DESPUÉS del boot screen
      setTimeout(() => preloadCriticalResources(), 500);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden portfolio-fade-in transition-colors duration-300">
      {/* Interactive canvas background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 dark:bg-slate-950/80 bg-white/90 backdrop-blur-lg border-b border-slate-800 dark:border-slate-800 border-slate-200 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Desktop menu - Centrado */}
            <div className="flex space-x-10 flex-1 justify-center">
              {['home', 'technologies', 'certificates', 'projects', 'contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`text-lg font-medium transition-all duration-300 relative group ${
                    activeSection === item
                      ? 'text-red-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-blue-400'
                  }`}
                >
                  {t(`nav.${item}`)}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 transition-all duration-300 ${
                      activeSection === item ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} 
                  />
                </a>
              ))}
            </div>
            
            {/* Language and Theme Toggles - Desktop */}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation - Always visible with icons */}
          <div className="md:hidden flex items-center justify-center h-14 px-1">
            {/* Navigation Icons - Centered */}
            <div className="flex items-center justify-around gap-1">
              {[
                { id: 'home', icon: Home },
                { id: 'technologies', icon: Cpu },
                { id: 'certificates', icon: Award },
                { id: 'projects', icon: Briefcase },
                { id: 'contact', icon: MessageCircle }
              ].map(({ id, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    activeSection === id
                      ? 'text-red-600 dark:text-blue-400 bg-red-50 dark:bg-blue-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                  aria-label={t(`nav.${id}`)}
                >
                  <Icon className="w-5 h-5" strokeWidth={activeSection === id ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-0.5 leading-tight">
                    {t(`nav.${id}`).split(' ')[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Action Buttons - Mobile Only (bottom-left) */}
      <div className="md:hidden fixed bottom-6 left-4 z-50 flex flex-col gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="w-6 h-6 text-slate-300" />
          ) : (
            <Sun className="w-6 h-6 text-amber-500" />
          )}
        </button>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle language"
        >
          <span className="text-2xl leading-none flex items-center justify-center h-full" role="img" aria-label={language === 'en' ? 'English' : 'Español'}>
            {language === 'en' ? '🇺🇸' : '🇪🇸'}
          </span>
        </button>
      </div>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative pt-16 bg-transparent transition-colors duration-300 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 dark:from-blue-900/20 via-transparent to-purple-900/10 dark:to-purple-900/20 transition-colors duration-300" />
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido de texto - Izquierda */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
                {t('hero.name')}
              </h1>
              <p className="text-2xl md:text-3xl text-slate-200 dark:text-slate-100 text-slate-700 mb-6 font-medium transition-colors duration-300">
                {t('hero.title')}
              </p>
              <p className="text-lg md:text-xl text-slate-200 dark:text-slate-100 text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed min-h-[120px] text-justify transition-colors duration-300">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </p>

              {/* Botón CV y Redes Sociales */}
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

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 dark:border-white/10 border-slate-300 transition-colors duration-300">
                {[
                  { value: '2+', label: t('hero.stats.experience') },
                  { value: '15+', label: t('hero.stats.projects') },
                  { value: '20+', label: t('hero.stats.technologies') }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400 dark:text-slate-400 text-slate-600 mt-1 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animación 3D de Spline - Derecha en desktop, abajo en móvil */}
            <div className="relative h-[400px] lg:h-[600px] w-full overflow-hidden rounded-2xl mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
              <div className="relative spline-container">
                {/* Contenedor con dimensiones extra para recortar y centrar */}
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
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="technologies" className="pt-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t('technologies.title')}
          </h2>
          {/* Tab Navigation Bar - Estilo Facebook */}
          <div className="flex justify-center mb-12 border-b border-slate-700/50 dark:border-slate-700/50 border-slate-300 transition-colors duration-300">
            <div className="flex gap-1 sm:gap-2">
              {techCategories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleManualTabChange(index)}
                  className={`px-3 sm:px-6 md:px-8 py-3 md:py-4 font-medium relative transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base ${
                    currentTechTab === index
                      ? 'text-red-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Mostrar título corto en móvil, completo en desktop */}
                  <span className="hidden sm:inline">{category.title}</span>
                  <span className="inline sm:hidden">{category.shortTitle}</span>
                  {/* Línea indicadora inferior con transición suave */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 transition-all duration-1000 ${
                      currentTechTab === index ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Technology Cards Container with dynamic height */}
          <div 
            ref={techContainerRef}
            className="tech-cards-container"
            style={{ height: containerHeight }}
          >
            {/* Previous tab cards (exiting) - solo renderizar si está en transición */}
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

            {/* Current tab cards - solo renderizar cuando esté listo */}
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

      {/* Certificates Section */}
      <section id="certificates" className="pt-20 bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
        {/* Títulos centrados */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t('certificates.title')}
          </h2>
        </div>

        {/* Carousel Container - Full Width */}
        <div className="relative w-full">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none transition-colors duration-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none transition-colors duration-300"></div>

          {/* Scrollable container */}
          <div
            ref={certificateContainerRef}
            className="flex gap-6 overflow-x-hidden py-4"
            onMouseEnter={() => setIsCertificateCarouselPaused(true)}
            onMouseLeave={() => setIsCertificateCarouselPaused(false)}
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Duplicate certificates for infinite scroll effect */}
            {[...certificates, ...certificates, ...certificates].map((cert, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[420px] bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/40 group cursor-pointer"
              >
                {/* Certificate Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  <img
                    src={`/images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-800w.webp`}
                    srcSet={`
                      /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-400w.webp 400w,
                      /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-800w.webp 800w,
                      /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-1200w.webp 1200w
                    `}
                    sizes="(max-width: 640px) 400px, 800px"
                    alt={cert.title}
                    width="420"
                    height="256"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${cert.icon}</div>`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900 dark:via-slate-900/20 dark:to-transparent"></div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {cert.title}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <div className="mt-1.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:animate-pulse"></div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {cert.org}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section ref={projectsSectionRef} id="projects" className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t('projects.title')}
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedProject(project);
                  setIsModalOpen(true);
                }}
                onMouseEnter={() => {
                  setHoveredProject(project);
                  // Precargar video para modal cuando se hace hover
                  preloadVideoOnHover(project.video);
                }}
                onMouseLeave={() => setHoveredProject(null)}
                className="project-card bg-white/90 dark:bg-slate-900/50 backdrop-blur-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/30 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-48 flex items-center justify-center relative overflow-hidden">
                  {/* Video de fondo con carga diferida ULTRA-OPTIMIZADA */}
                  {projectsVisible ? (
                    <video
                      key={project.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      poster={project.video.replace('.mp4', '-poster.webp')}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                      loading="lazy"
                      onLoadStart={(e) => {
                        // Cargar solo cuando realmente sea necesario
                        const video = e.target;
                        if (!video.hasAttribute('data-loaded')) {
                          video.setAttribute('data-loaded', 'true');
                        }
                      }}
                      onLoadedData={(e) => {
                        e.target.muted = true;
                        e.target.play().catch(() => {}); // Silenciar errores de autoplay
                      }}
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        contentVisibility: 'auto' // Optimización de rendering
                      }}
                    >
                      <source src={project.video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600/50 to-purple-600/50 animate-pulse" />
                  )}

                  {/* Overlay con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900/80 dark:via-transparent dark:to-transparent" />

                  {/* Icono de play al hacer hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="text-white font-bold text-lg flex items-center gap-2">
                      <Code className="w-6 h-6" />
                      {t('projects.viewDemo')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 text-slate-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-red-50 dark:bg-slate-800 text-xs rounded-full text-red-600 dark:text-blue-400 border border-red-200 dark:border-transparent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(project.links).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 dark:hover:from-blue-500 dark:hover:to-purple-500 hover:text-white rounded-full text-sm transition-all duration-300 border border-slate-200 dark:border-transparent"
                      >
                        <span className="capitalize">{key}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 lg:py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t('contact.title')}
            </h2>
            <p className="text-slate-300 dark:text-slate-300 text-slate-600 text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-stretch">
            {/* Left Column - Profile Image & Info */}
            <div className="contact-left-column">
              {/* Profile Image Card */}
              <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/70 transition-all duration-500 shadow-lg dark:shadow-2xl group h-full flex flex-col">
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-64 sm:h-80 md:h-96 lg:h-[400px] overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  {/* Profile Image */}
                  <img 
                    src="/images/optimized/foto-perfil-800w.webp" 
                    srcSet="
                      /images/optimized/foto-perfil-400w.webp 400w,
                      /images/optimized/foto-perfil-800w.webp 800w,
                      /images/optimized/foto-perfil-1200w.webp 1200w
                    "
                    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
                    alt="Mateo Dueñas - Software Engineer"
                    width="800"
                    height="1000"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent"></div>
                  
                  {/* Animated Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('contact.profile.name')}
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 text-slate-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed flex-1">
                    {t('contact.profile.bio')}
                  </p>

                  {/* Social Links */}
                  <div className="space-y-3 md:space-y-4">
                    <a
                      href="mailto:mate.due02@gmail.com"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">{t('contact.profile.emailLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">mate.due02@gmail.com</p>
                      </div>
                    </a>

                    <a
                      href="https://linkedin.com/in/mateo-dueñas-andrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Linkedin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">{t('contact.profile.linkedinLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">mateo-dueñas-andrade</p>
                      </div>
                    </a>

                    <a
                      href="https://github.com/majoduan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Github className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">{t('contact.profile.githubLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">majoduan</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="contact-right-column">
              <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-slate-200 dark:border-slate-700/50 hover:border-purple-400 dark:hover:border-purple-500/70 transition-all duration-500 shadow-lg dark:shadow-2xl h-full">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {t('contact.form.title')}
                </h3>
                <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm md:text-base mb-6 md:mb-8">
                  {t('contact.form.subtitle')}
                </p>
                <Suspense fallback={
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                }>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 dark:border-slate-800 border-slate-200 text-center text-slate-400 dark:text-slate-400 text-slate-600 relative z-10 transition-colors duration-300">
        <p>{t('footer.copyright')}</p>
      </footer>

      {/* Modal para videos de proyectos - Layout de dos columnas */}
      {isModalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="project-modal bg-white dark:bg-slate-900 rounded-3xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-200 dark:border-blue-500/50 shadow-2xl dark:shadow-blue-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal - Sticky con botón de cerrar */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {selectedProject.title}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenedor principal - Dos columnas en desktop, una en móvil */}
            <div className="project-modal-content grid grid-cols-1 lg:grid-cols-[66.666%_33.334%] gap-0 h-[calc(90vh-80px)] overflow-hidden">
              {/* Columna Izquierda - Video (2/3 del ancho, fijo en desktop) */}
              <div className="project-modal-video-column bg-slate-50 dark:bg-black lg:h-full flex items-center justify-center p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Indicador de carga mientras el video se carga */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center z-0 rounded-2xl">
                    <div className="text-center">
                      <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{t('projects.loading')}</p>
                    </div>
                  </div>
                  <video
                    key={selectedProject.video}
                    controls
                    autoPlay
                    preload="auto"
                    poster={selectedProject.video.replace('.mp4', '-poster.webp')}
                    playsInline
                    className="w-full h-auto max-h-full relative z-10 rounded-2xl shadow-2xl"
                    onLoadedData={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    style={{ 
                      opacity: 0, 
                      transition: 'opacity 0.3s ease-in-out',
                      contentVisibility: 'auto'
                    }}
                  >
                    <source src={selectedProject.video} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </div>

              {/* Columna Derecha - Información (1/3 del ancho, scroll independiente) */}
              <div className="project-modal-info-column bg-slate-50 dark:bg-slate-900 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                {/* Descripción corta */}
                <div className="mb-6">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Descripción larga */}
                {selectedProject.longDescription && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                      {t('projects.modalTitle')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify">
                      {selectedProject.longDescription}
                    </p>
                  </div>
                )}

                {/* Tecnologías Utilizadas */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                    {t('projects.techUsed')}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="px-4 py-2 bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-full text-red-600 dark:text-blue-400 font-medium text-sm border border-red-300 dark:border-blue-500/30 hover:border-red-500 dark:hover:border-blue-500/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Enlaces del proyecto */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                    {t('projects.projectLinks')}
                  </h4>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {Object.entries(selectedProject.links).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 hover:from-red-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50"
                      >
                        <span className="capitalize">{key}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Espaciado inferior para mejor scrolling */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
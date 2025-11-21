import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { Camera, Mail, Linkedin, Github, Award, ExternalLink, Menu, X, Code } from 'lucide-react';
import TechCard from './components/TechCard';
import { technologies } from './data/technologies';
import { projects, certificates } from './data/projects';

// Lazy load Spline para mejorar el tiempo de carga inicial
const Spline = lazy(() => import('@splinetool/react-spline'));

const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [bootSequence, setBootSequence] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateScrollPosition, setCertificateScrollPosition] = useState(0);
  const [isCertificateCarouselPaused, setIsCertificateCarouselPaused] = useState(false);
  const [isTechCardHovered, setIsTechCardHovered] = useState(false); // Nuevo estado para detectar hover en cards
  const [lastManualChange, setLastManualChange] = useState(0); // Timestamp del último cambio manual
  const [activeSection, setActiveSection] = useState('home'); // Estado para la sección activa

  // Estados para manejar la transición de tecnologías
  const [currentTechTab, setCurrentTechTab] = useState(0);
  const [previousTechTab, setPreviousTechTab] = useState(null);
  const [techTransitionState, setTechTransitionState] = useState('idle'); // 'idle', 'exiting', 'entering'

  const canvasRef = useRef(null);
  const particles = useRef([]);
  const splineRef = useRef(null);
  const certificateContainerRef = useRef(null);

  // Texto completo para el efecto typewriter
  const fullText = "Software Engineering student at Escuela Politécnica Nacional with hands-on experience in full-stack development, database management, and data analysis. Building secure, scalable systems with modern technologies.";

  // Función para manejar el evento de carga de Spline
  const onSplineLoad = (spline) => {
    splineRef.current = spline;
    console.log('Spline cargado correctamente');
  };

  // Función para manejar el movimiento del mouse sobre Spline
  const onSplineMouseMove = (e) => {
    if (splineRef.current) {
      // Spline maneja automáticamente el movimiento del mouse si está configurado en la escena
      // La escena debe tener la configuración de seguimiento de mouse habilitada
    }
  };

  // Función para manejar cambios manuales de tab
  const handleManualTabChange = (index) => {
    setActiveTab(index);
    setLastManualChange(Date.now()); // Actualizar timestamp para reiniciar el temporizador
  };

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

  // Boot sequence messages
  const bootMessages = [
    "INITIALIZING SYSTEM...",
    "LOADING NEURAL NETWORKS...",
    "COMPILING PORTFOLIO DATA...",
    "ESTABLISHING CONNECTION...",
    "SYSTEM ONLINE"
  ];

  // Technology categories with detailed skill data
  const techCategories = [
    {
      id: "backend",
      title: "Backend Development",
      description: "Technology stack I master to create complete and scalable solutions"
    },
    {
      id: "frontend",
      title: "Frontend Development",
      description: "Technologies to create modern and responsive user interfaces"
    },
    {
      id: "databases",
      title: "Databases",
      description: "Relational and NoSQL data management systems"
    },
    {
      id: "devops",
      title: "DevOps & Tools",
      description: "Tools for development, deployment and collaboration"
    }
  ];

  // Boot sequence animation
  useEffect(() => {
    if (bootSequence < bootMessages.length) {
      const timer = setTimeout(() => {
        setBootSequence(bootSequence + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [bootSequence]);

  // Typewriter effect for hero description
  useEffect(() => {
    if (loading) return;

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
  }, [loading]);

  // Particle system optimizado - reducido a 30 partículas y optimizado el renderizado
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reducir partículas de 50 a 30 para mejor rendimiento
    const particleCount = 30;
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

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particlesArray = particles.current;
      const len = particlesArray.length;

      for (let i = 0; i < len; i++) {
        const particle = particlesArray[i];
        
        // Mouse interaction optimizada
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx -= (dx / distance) * force * 0.2;
          particle.vy -= (dy / distance) * force * 0.2;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundary check optimizado
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();

        // Conectar solo con partículas cercanas (optimizado)
        for (let j = i + 1; j < len; j++) {
          const other = particlesArray[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 80)})`;
            ctx.stroke();
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
  }, [loading]);

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
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/20" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Boot sequence */}
        <div className="relative z-10 text-center space-y-8 px-4">
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping" />
              <div className="absolute inset-4 border-4 border-purple-500/30 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-8 border-4 border-cyan-500/30 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Code className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {bootMessages.slice(0, bootSequence).map((msg, i) => (
              <div
                key={i}
                className="text-cyan-400 font-mono text-sm md:text-lg tracking-wider animate-pulse"
              >
                &gt; {msg}
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 w-12 rounded-full transition-all duration-300 ${i < bootSequence ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      {/* Interactive canvas background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            {/* Desktop menu - Centrado */}
            <div className="hidden md:flex space-x-10">
              {['Home', 'Technologies', 'Certificates', 'Projects', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.toLowerCase());
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`text-lg font-medium transition-all duration-300 relative group ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-400'
                      : 'text-slate-300 hover:text-blue-400'
                  }`}
                >
                  {item}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${
                      activeSection === item.toLowerCase() ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} 
                  />
                </a>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden absolute right-4 text-slate-300 hover:text-blue-400"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['Home', 'Technologies', 'Certificates', 'Projects', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    const element = document.getElementById(item.toLowerCase());
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-400 bg-slate-800'
                      : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/20" />
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido de texto - Izquierda */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Mateo Dueñas
              </h1>
              <p className="text-2xl md:text-3xl text-slate-100 mb-6 font-medium">
                Software Engineer | Full-Stack Developer
              </p>
              <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed min-h-[120px] text-justify">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </p>

              {/* Botón CV y Redes Sociales */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                <a
                  href="/cv/Mateo_Dueñas_CV.pdf"
                  download="Mateo_Dueñas_CV.pdf"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  Download my CV
                </a>

                {/* Iconos sociales */}
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com/in/mateo-dueñas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://github.com/mateo-dueñas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Github className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="mailto:mateo.duenas@epn.edu.ec"
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                {[
                  { value: '3+', label: 'years of experience' },
                  { value: '15+', label: 'projects' },
                  { value: '20+', label: 'technologies' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animación 3D de Spline - Derecha */}
            <div className="hidden lg:block relative h-[600px] w-full overflow-hidden rounded-2xl">
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
      <section id="technologies" className="pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Technologies and Tools
          </h2>
          {/* Tab Navigation Bar - Estilo Facebook */}
          <div className="flex justify-center mb-12 border-b border-slate-700/50">
            <div className="flex gap-2">
              {techCategories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleManualTabChange(index)}
                  className={`px-8 py-4 font-medium relative transition-all duration-1000 ${currentTechTab === index
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                >
                  {category.title}
                  {/* Línea indicadora inferior con transición suave */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ${currentTechTab === index ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Technology Cards Container with fixed height */}
          <div className="tech-cards-container">
            {/* Previous tab cards (exiting) - solo renderizar si está en transición */}
            {techTransitionState === 'exiting' && previousTechTab !== null && (
              <div className="tech-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="tech-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section id="certificates" className="pt-20 bg-slate-900/30 relative z-10 overflow-hidden">
        {/* Títulos centrados */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Certificates & Recognition
          </h2>
        </div>

        {/* Carousel Container - Full Width */}
        <div className="relative w-full">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900/90 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900/90 to-transparent z-10 pointer-events-none"></div>

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
                className="flex-shrink-0 w-[420px] bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/70 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 group cursor-pointer"
              >
                {/* Certificate Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${cert.icon}</div>`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors leading-tight">
                    {cert.title}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-400">
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
      <section id="projects" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Featured Projects
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
                className="project-card bg-slate-900/50 backdrop-blur-lg rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-48 flex items-center justify-center relative overflow-hidden">
                  {/* Video de fondo con reproducción automática - optimizado */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                    onLoadedMetadata={(e) => {
                      e.target.muted = true;
                    }}
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>

                  {/* Overlay con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  {/* Icono de play al hacer hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="text-white font-bold text-lg flex items-center gap-2">
                      <Code className="w-6 h-6" />
                      Ver Demo Completo
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-slate-800 text-xs rounded-full text-blue-400"
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
                        className="flex items-center space-x-1 px-4 py-2 bg-slate-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-full text-sm transition-all duration-300"
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
      <section id="contact" className="pb-20 bg-slate-900/30 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 pb-2 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="mailto:mate.due02@gmail.com"
              className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-800 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
            >
              <Mail className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-slate-400 text-sm">mate.due02@gmail.com</p>
            </a>
            <a
              href="https://linkedin.com/in/mateo-dueñas-andrade"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-800 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
            >
              <Linkedin className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
              <p className="text-slate-400 text-sm">mateo-dueñas-andrade</p>
            </a>
            <a
              href="https://github.com/majoduan"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-800 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
            >
              <Github className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">GitHub</h3>
              <p className="text-slate-400 text-sm">majoduan</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-slate-400 relative z-10">
        <p>© 2024 Mateo Dueñas. Built with React & Tailwind CSS</p>
      </footer>

      {/* Modal para videos de proyectos */}
      {isModalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedProject.title}
                </h3>
                <p className="text-slate-400 mt-1">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video del proyecto */}
            <div className="p-6">
              <div className="relative bg-black rounded-2xl overflow-hidden mb-6">
                <video
                  controls
                  autoPlay
                  preload="metadata"
                  className="w-full h-auto"
                  poster="/images/video-placeholder.jpg"
                >
                  <source src={selectedProject.video} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>

              {/* Tecnologías */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">Tecnologías Utilizadas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((tech, j) => (
                    <span
                      key={j}
                      className="px-4 py-2 bg-slate-800 rounded-full text-blue-400 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Enlaces */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Enlaces</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(selectedProject.links).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="capitalize">{key}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { preloadCriticalResources } from './utils/preloadResources';

const HUDBootScreen = lazy(() => import('./components/HUDBootScreen'));

// Section components
import ParticleCanvas from './components/sections/ParticleCanvas';
import NavigationBar from './components/sections/NavigationBar';
import HeroSection from './components/sections/HeroSection';
import TechnologiesSection from './components/sections/TechnologiesSection';
import CertificatesSection from './components/sections/CertificatesSection';
import ProjectsSection from './components/sections/ProjectsSection';
import ContactSection from './components/sections/ContactSection';

const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [splineReady, setSplineReady] = useState(false);
  const shouldLoadSpline = useMemo(() => window.innerWidth >= 768, []);

  // Precarga de Spline durante el boot screen (solo desktop/tablet)
  useEffect(() => {
    if (!shouldLoadSpline) {
      setSplineReady(true); // No se necesita Spline en movil
      return;
    }
    // Pre-cargar solo el módulo JS de Spline (no la escena .splinecode)
    // La escena la descarga el componente Spline internamente
    import('@splinetool/react-spline')
      .then(() => setSplineReady(true))
      .catch(() => setSplineReady(true));
  }, [shouldLoadSpline]);

  if (loading) {
    return (
      <Suspense fallback={<div className="fixed inset-0" style={{ backgroundColor: '#000000' }} />}>
        <HUDBootScreen
          onComplete={() => {
            setLoading(false);
            setTimeout(() => preloadCriticalResources(), 500);
          }}
          splineReady={splineReady}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden portfolio-fade-in transition-colors duration-300">
      <ParticleCanvas />
      <NavigationBar />
      <HeroSection shouldLoadSpline={shouldLoadSpline} />
      <TechnologiesSection />
      <CertificatesSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
};

export default Portfolio;

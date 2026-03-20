'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { preloadCriticalResources } from '../utils/preloadResources';

const HUDBootScreen = dynamic(() => import('../components/HUDBootScreen'), {
  ssr: false,
  loading: () => <div className="fixed inset-0" style={{ backgroundColor: '#000000' }} />,
});

import ParticleCanvas from '../components/sections/ParticleCanvas';
import NavigationBar from '../components/sections/NavigationBar';
import HeroSection from '../components/sections/HeroSection';
import TechnologiesSection from '../components/sections/TechnologiesSection';
import CertificatesSection from '../components/sections/CertificatesSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [splineReady, setSplineReady] = useState(false);
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);

  // SSR-safe: detect desktop viewport only on client
  useEffect(() => {
    setShouldLoadSpline(window.innerWidth >= 768);
  }, []);

  // Pre-load Spline JS module during boot screen (desktop/tablet only)
  useEffect(() => {
    if (!shouldLoadSpline) {
      setSplineReady(true);
      return;
    }
    import('@splinetool/react-spline')
      .then(() => setSplineReady(true))
      .catch(() => setSplineReady(true));
  }, [shouldLoadSpline]);

  if (loading) {
    return (
      <HUDBootScreen
        onComplete={() => {
          setLoading(false);
          setTimeout(() => preloadCriticalResources(), 500);
        }}
        splineReady={splineReady}
      />
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
}

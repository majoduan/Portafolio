'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import HeroSection from '../components/sections/HeroSection';
import TechnologiesSection from '../components/sections/TechnologiesSection';
import IntegrationsMarquee from '../components/sections/IntegrationsMarquee';
import CertificatesSection from '../components/sections/CertificatesSection';

// Lazy-load below-fold sections
const ProjectsSection = dynamic(() => import('../components/sections/ProjectsSection'), {
  loading: () => <div className="py-20 min-h-[400px]" />,
});
const ContactSection = dynamic(() => import('../components/sections/ContactSection'), {
  loading: () => <div className="py-20 min-h-[400px]" />,
});

export default function HomePage() {
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);

  // SSR-safe: detect tablet+/desktop viewport on client + reactivo a resize.
  // matchMedia es mas eficiente que resize event (no se dispara en cada pixel,
  // solo al cruzar el breakpoint). Se sincroniza correctamente al rotar
  // dispositivo (portrait <-> landscape) o redimensionar ventana.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setShouldLoadSpline(mql.matches);
    const handler = (e) => setShouldLoadSpline(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <HeroSection shouldLoadSpline={shouldLoadSpline} />
      <TechnologiesSection />
      <IntegrationsMarquee />
      <CertificatesSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}

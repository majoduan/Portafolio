'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import HeroSection from '../components/sections/HeroSection';
import TechnologiesSection from '../components/sections/TechnologiesSection';
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

  // SSR-safe: detect desktop viewport only on client
  useEffect(() => {
    setShouldLoadSpline(window.innerWidth >= 768);
  }, []);

  return (
    <>
      <HeroSection shouldLoadSpline={shouldLoadSpline} />
      <TechnologiesSection />
      <CertificatesSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}

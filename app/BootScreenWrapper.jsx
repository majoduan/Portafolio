'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { preloadCriticalResources } from '../utils/preloadResources';
import NavigationBar from '../components/sections/NavigationBar';
import ParticleCanvas from '../components/sections/ParticleCanvas';

const HUDBootScreen = dynamic(() => import('../components/HUDBootScreen'), {
  ssr: false,
  loading: () => <div className="fixed inset-0" style={{ backgroundColor: '#000000' }} />,
});

// Survives client-side (SPA) navigations, resets on full page reload
let introShown = false;

export default function BootScreenWrapper({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [loading, setLoading] = useState(!introShown);
  const [justBooted, setJustBooted] = useState(false);
  const [splineReady, setSplineReady] = useState(!isHome);
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);

  // SSR-safe: detect desktop viewport only on client (for Spline preload)
  useEffect(() => {
    if (!isHome) return;
    setShouldLoadSpline(window.innerWidth >= 768);
  }, [isHome]);

  // Pre-load Spline JS module during boot screen (home + desktop/tablet only)
  useEffect(() => {
    if (!isHome) return;
    if (!shouldLoadSpline) {
      setSplineReady(true);
      return;
    }
    import('@splinetool/react-spline')
      .then(() => setSplineReady(true))
      .catch(() => setSplineReady(true));
  }, [isHome, shouldLoadSpline]);

  // Preload critical resources during boot screen idle time
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => preloadCriticalResources(), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <HUDBootScreen
        onComplete={() => {
          introShown = true;
          setJustBooted(true);
          setLoading(false);
        }}
        splineReady={splineReady}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-slate-900 dark:text-white relative overflow-x-hidden transition-colors duration-300${justBooted ? ' portfolio-fade-in' : ''}`}>
      <ParticleCanvas />
      <NavigationBar />
      {children}
    </div>
  );
}

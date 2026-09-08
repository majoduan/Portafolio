'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { bootStore } from '../lib/boot/bootStore';
import { runBootSequence } from '../lib/boot/orchestrator';
import { schedulePreload } from '../utils/preloadResources';
import BootOverlay from '../components/boot/BootOverlay';
import NavigationBar from '../components/sections/NavigationBar';
import ParticleCanvas from '../components/sections/ParticleCanvas';

/**
 * BootScreenWrapper — el boot screen es un OVERLAY sobre la página real.
 *
 * Antes: mientras `loading`, se renderizaba SOLO el boot (el HTML prerenderizado
 * era un div negro; la página entera se montaba al terminar y la escena 3D
 * empezaba a descargarse recién entonces, con spinner a la vista).
 *
 * Ahora: la página se renderiza (SSR incluido) debajo del overlay desde el
 * primer instante — el h1 y el hero existen en el HTML (SEO/LCP), la escena
 * Spline se descarga y parsea DURANTE el boot, y el overlay se levanta cuando
 * está lista (o al agotar el presupuesto; la galaxia ya está visible debajo).
 * `inert` + `aria-busy` bloquean foco/lectores mientras el overlay está.
 *
 * El progreso y la animación viven fuera de React (bootStore + Web Worker).
 */
export default function BootScreenWrapper({ children, footer }) {
  const pathname = usePathname();
  const [booting, setBooting] = useState(() => !bootStore.get().done);
  const [fading, setFading] = useState(false);
  const [revealed, setRevealed] = useState(() => bootStore.get().done);
  const [justBooted, setJustBooted] = useState(false);
  const startedRef = useRef(false);
  const pathRef = useRef(pathname);
  const shellRef = useRef(null);

  // `inert` bloquea foco/clicks/lectores de pantalla en la página mientras el
  // overlay está. React 18 no serializa `inert=""`, así que se aplica por ref.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (booting) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }, [booting]);

  useEffect(() => {
    if (!booting || startedRef.current) return;
    startedRef.current = true;
    runBootSequence({
      pathname: pathRef.current,
      onFadeStart: () => {
        // El overlay empieza su fade-out: la página hace su fade-in a la vez
        // (mismo solape que antes) y arrancan las partículas.
        setJustBooted(true);
        setRevealed(true);
        setFading(true);
      },
      onDone: () => {
        setBooting(false);
        schedulePreload();
      },
    });
  }, [booting]);

  return (
    <>
      {booting && <BootOverlay fading={fading} />}
      <div
        ref={shellRef}
        className={`min-h-screen bg-[var(--bg-primary)] text-slate-900 dark:text-white relative overflow-x-hidden${justBooted ? ' portfolio-fade-in' : ''}`}
        aria-busy={booting ? 'true' : undefined}
      >
        {revealed && <ParticleCanvas />}
        <NavigationBar />
        <main id="main">{children}</main>
        {footer}
      </div>
    </>
  );
}

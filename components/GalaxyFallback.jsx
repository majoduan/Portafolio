'use client';
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * GalaxyFallback — SVG de una galaxia espiral estilo Vía Láctea que se muestra
 * en desktop/tablet cuando la escena 3D de Spline no logra cargar.
 *
 * - Rota muy lentamente sobre su propio eje (clase .galaxy-spin en globals.css,
 *   ~140s/vuelta, se detiene con prefers-reduced-motion).
 * - Los colores son theme-aware via CSS vars (--galaxy-*): tonos luminosos en
 *   modo oscuro, tonos oscuros/saturados en modo claro (ver app/globals.css).
 * - Inline SVG sin dependencias; las estrellas tienen coords fijas (sin
 *   Math.random) para un render determinista.
 */

// Campo de estrellas — coords/tamaños fijos dentro del viewBox 400x400.
const STARS = [
  { x: 70, y: 90, r: 1.4, o: 0.9 }, { x: 120, y: 60, r: 1, o: 0.7 },
  { x: 300, y: 80, r: 1.6, o: 0.95 }, { x: 340, y: 130, r: 1, o: 0.6 },
  { x: 60, y: 300, r: 1.2, o: 0.8 }, { x: 110, y: 340, r: 1, o: 0.65 },
  { x: 330, y: 320, r: 1.5, o: 0.9 }, { x: 290, y: 350, r: 1, o: 0.6 },
  { x: 200, y: 40, r: 1.2, o: 0.8 }, { x: 380, y: 220, r: 1, o: 0.55 },
  { x: 30, y: 200, r: 1.1, o: 0.7 }, { x: 250, y: 120, r: 0.9, o: 0.85 },
  { x: 150, y: 280, r: 0.9, o: 0.8 }, { x: 95, y: 160, r: 0.8, o: 0.6 },
  { x: 310, y: 250, r: 0.9, o: 0.75 }, { x: 175, y: 150, r: 0.8, o: 0.7 },
  { x: 230, y: 260, r: 0.8, o: 0.7 }, { x: 130, y: 210, r: 0.7, o: 0.6 },
  { x: 270, y: 190, r: 0.7, o: 0.65 }, { x: 200, y: 330, r: 1, o: 0.7 },
  { x: 50, y: 130, r: 0.8, o: 0.6 }, { x: 360, y: 290, r: 0.9, o: 0.6 },
];

const GalaxyFallback = React.memo(() => {
  const { t } = useTranslation();
  const label = t('hero.galaxyAlt');

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      role="img"
      aria-label={typeof label === 'string' ? label : 'Galaxy'}
    >
      <defs>
        {/* Núcleo brillante */}
        <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--galaxy-core)" />
          <stop offset="45%" stopColor="var(--galaxy-core)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--galaxy-core)" stopOpacity="0" />
        </radialGradient>

        {/* Halo exterior tenue */}
        <radialGradient id="galaxyHaze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--galaxy-haze)" />
          <stop offset="70%" stopColor="var(--galaxy-haze)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--galaxy-haze)" stopOpacity="0" />
        </radialGradient>

        {/* Disco / brazos de la nebulosa (degradado violeta → teal) */}
        <linearGradient id="galaxyArms" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--galaxy-arm-1)" />
          <stop offset="100%" stopColor="var(--galaxy-arm-2)" />
        </linearGradient>

        {/* Desenfoque suave para dar aspecto de nube/nebulosa */}
        <filter id="galaxyBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Grupo que rota sobre su propio eje (animación en globals.css). */}
      <g className="galaxy-spin">
        {/* Halo difuso de fondo */}
        <circle cx="200" cy="200" r="180" fill="url(#galaxyHaze)" />

        {/* Disco espiral inclinado (-22°) con brazos desenfocados */}
        <g transform="rotate(-22 200 200)" filter="url(#galaxyBlur)">
          <ellipse cx="200" cy="200" rx="165" ry="62" fill="url(#galaxyArms)" opacity="0.45" />
          <ellipse cx="200" cy="200" rx="120" ry="44" fill="url(#galaxyArms)" opacity="0.55" />

          {/* Brazos espirales sugeridos con trazos curvos */}
          <path
            d="M200 200 C 250 178, 300 196, 320 240 C 332 270, 312 304, 272 312"
            fill="none"
            stroke="var(--galaxy-arm-1)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M200 200 C 150 222, 100 204, 80 160 C 68 130, 88 96, 128 88"
            fill="none"
            stroke="var(--galaxy-arm-2)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>

        {/* Núcleo brillante por encima de los brazos */}
        <ellipse cx="200" cy="200" rx="58" ry="58" fill="url(#galaxyCore)" />
        <circle cx="200" cy="200" r="10" fill="var(--galaxy-core)" />

        {/* Campo de estrellas */}
        <g>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--galaxy-star)" opacity={s.o} />
          ))}
        </g>
      </g>
    </svg>
  );
});

GalaxyFallback.displayName = 'GalaxyFallback';

export default GalaxyFallback;

'use client';
import React from 'react';
import { integrations } from '../../data/integrations';
import { useTranslation } from '../../hooks/useTranslation';

// Per-logo size overrides. Defaults to DEFAULT_SIZE otherwise.
// Tailwind class strings are kept literal here so the JIT compiler can see them.
const DEFAULT_SIZE = 'h-10 md:h-14';
const SIZE_OVERRIDES = {
  SendGrid: 'h-14 md:h-20',
  Twilio:   'h-14 md:h-20',
  PostHog:  'h-14 md:h-20',
  Sentry:   'h-14 md:h-20',
  OpenAI:   'h-8 md:h-10',
};

// Logos that are pure black (or have black wordmarks) and disappear in dark mode.
// `invert(1) hue-rotate(180deg)` flips black→white while keeping colored parts intact
// (the hue-rotate is a no-op on grayscale and reverses the inversion on colored pixels).
const DARK_INVERT = new Set(['OpenAI', 'Anthropic', 'PostHog']);

const IntegrationsMarquee = React.memo(() => {
  const { t } = useTranslation();
  // Duplicate the list for a seamless infinite loop (track translates -50%)
  const loop = [...integrations, ...integrations];

  return (
    <section
      className="integrations-marquee py-16 relative overflow-hidden bg-transparent"
      aria-label={t('integrations.title')}
    >
      <h3 className="text-center text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-10 uppercase tracking-[0.2em]">
        {t('integrations.title')}
      </h3>

      <div
        className="integrations-mask relative"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="integrations-track flex items-center gap-12 md:gap-20">
          {loop.map((logo, i) => {
            const size = SIZE_OVERRIDES[logo.name] || DEFAULT_SIZE;
            const invertClass = DARK_INVERT.has(logo.name)
              ? 'dark:[filter:invert(1)_hue-rotate(180deg)]'
              : '';
            return (
              <img
                key={`${logo.name}-${i}`}
                src={logo.src}
                alt={logo.alt}
                className={`${size} w-auto select-none flex-shrink-0 ${invertClass}`}
                loading="lazy"
                draggable="false"
                aria-hidden={i >= integrations.length ? 'true' : 'false'}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
});

IntegrationsMarquee.displayName = 'IntegrationsMarquee';
export default IntegrationsMarquee;

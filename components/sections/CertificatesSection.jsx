'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pause, Play } from 'lucide-react';
import { getCertificatesData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';

const CertificatesSection = React.memo(() => {
  const { t } = useTranslation();

  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const [isCertificateCarouselPaused, setIsCertificateCarouselPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  // viewMode drives carousel mechanics (step, dots count); the visible count
  // (1/2/3) is handled purely via Tailwind responsive width classes.
  const [viewMode, setViewMode] = useState('mobile');

  const certificateContainerRef = useRef(null);

  const certificates = useMemo(() => getCertificatesData(t), [t]);

  // Mobile <768 (1 visible, step 1); tablet 768-1023 (2 visible, step 2);
  // desktop ≥1024 (3 visible, step 2). Aligns with Tailwind md/lg breakpoints.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) return 'mobile';
      if (w < 1024) return 'tablet';
      return 'desktop';
    };
    setViewMode(compute());
    const handleResize = () => setViewMode(compute());
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleCards = viewMode === 'mobile' ? 1 : viewMode === 'tablet' ? 2 : 3;
  const step = viewMode === 'mobile' ? 1 : 2;

  // Reachable carousel positions. The last position leaves the final
  // `visibleCards` cards aligned with the viewport (math: target scrollLeft
  // equals maxScroll exactly, so no browser clamping → no edge-card peek).
  // If `step` doesn't naturally land on the last viewable index, append it.
  const pageStops = useMemo(() => {
    const lastViewable = Math.max(0, certificates.length - visibleCards);
    const stops = [];
    for (let i = 0; i <= lastViewable; i += step) stops.push(i);
    if (stops[stops.length - 1] !== lastViewable) stops.push(lastViewable);
    return stops;
  }, [certificates.length, visibleCards, step]);

  // Auto-advance carousel cycling through pageStops (shared with dots so
  // automatic + manual stay in sync).
  useEffect(() => {
    if (!isManuallyPaused && !isCertificateCarouselPaused) {
      const interval = setInterval(() => {
        setCurrentCertificateIndex((prev) => {
          const idx = pageStops.indexOf(prev);
          if (idx === -1) {
            // prev not on a stop (e.g. user clicked a specific card) — jump to
            // the next stop greater than prev, or wrap to first.
            const nextStop = pageStops.find((s) => s > prev);
            return nextStop ?? pageStops[0];
          }
          return pageStops[(idx + 1) % pageStops.length];
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isManuallyPaused, isCertificateCarouselPaused, pageStops]);

  // Auto scroll on index change. Subtracts container padding-left so the card
  // lands with breathing room (not flush with the clipping edge), and clamps
  // to maxScroll defensively in case of resize / arbitrary card click.
  useEffect(() => {
    if (certificateContainerRef.current) {
      const container = certificateContainerRef.current;
      const cards = container.querySelectorAll('.certificate-card');
      const targetCard = cards[currentCertificateIndex];
      if (targetCard) {
        const padLeft = parseFloat(getComputedStyle(container).paddingLeft) || 0;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const target = Math.min(targetCard.offsetLeft - padLeft, maxScroll);
        container.scrollTo({
          left: Math.max(0, target),
          behavior: 'smooth'
        });
      }
    }
  }, [currentCertificateIndex, viewMode]);

  return (
    <section id="certificates" className="py-20 md:py-24 bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
      {/* Title row with pause button (button absolute-positioned right, mirrors TechnologiesSection) */}
      <div className="max-w-7xl mx-auto px-4 mb-6 relative">
        <h2 className="text-h2 font-bold text-center mb-4 pb-2 text-black dark:text-white">
          {t('certificates.title')}
        </h2>
        <button
          onClick={() => setIsManuallyPaused((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 max-[424px]:w-8 max-[424px]:h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all duration-300"
          aria-label={isManuallyPaused || isCertificateCarouselPaused ? 'Play carousel' : 'Pause carousel'}
        >
          {isManuallyPaused || isCertificateCarouselPaused
            ? <Play className="w-4 h-4 max-[424px]:w-3.5 max-[424px]:h-3.5" />
            : <Pause className="w-4 h-4 max-[424px]:w-3.5 max-[424px]:h-3.5" />
          }
        </button>
      </div>

      {/* Carousel Container - Responsive Grid */}
      <div className="relative w-full mx-auto px-4">
        {/* Scrollable container - Desktop: 2 cards, Mobile: 1 card */}
        <div
          ref={certificateContainerRef}
          className="relative overflow-x-hidden py-4 px-4 scrollbar-hide mx-auto"
          onMouseEnter={() => setIsCertificateCarouselPaused(true)}
          onMouseLeave={() => setIsCertificateCarouselPaused(false)}
          onTouchStart={() => setIsCertificateCarouselPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsCertificateCarouselPaused(false), 2000)}
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maxWidth: viewMode === 'mobile' ? 'min(90vw, 26.25rem)' : 'min(98vw, 87.5rem)'
          }}
        >
          {/* Certificate grid */}
          <div className="flex gap-6">
            {certificates.map((cert, i) => {
              const base = cert.slug;
              return (
              <div
                key={i}
                className="certificate-card flex-shrink-0 w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] bg-white/90 dark:bg-[var(--bg-secondary)] backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-[var(--btn-primary)] transition-all duration-300 transform hover:scale-105 shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:shadow-xl dark:hover:shadow-2xl group cursor-pointer"
                onClick={() => {
                  setCurrentCertificateIndex(i);
                  setIsCertificateCarouselPaused(true);
                  setTimeout(() => setIsCertificateCarouselPaused(false), 3000);
                }}
              >
                {/* Certificate Image — aspect 1.294 only; height auto-derives
                    from the responsive card width above. No fixed height so
                    cards never clip and the visible count fits exactly. */}
                <div className="relative aspect-[1.294] overflow-hidden bg-white">
                  {/* srcset AVIF manual, next/image unoptimized perderia srcset */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                      src={`/media/certificates/${base}-800w.avif`}
                      srcSet={`
                        /media/certificates/${base}-400w.avif 400w,
                        /media/certificates/${base}-800w.avif 800w,
                        /media/certificates/${base}-1200w.avif 1200w
                      `}
                      sizes="(max-width: 640px) 400px, 800px"
                      alt={cert.title}
                      width="420"
                      height="288"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${cert.icon}</div>`;
                      }}
                    />

                  {/* Bottom gradient overlay — stronger on hover for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300 group-hover:from-black/85 group-hover:via-black/30" />

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>

                  {/* Content overlay — title and org */}
                  <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                    <h3 className="text-white font-bold text-lg md:text-xl leading-tight transition-transform duration-300 group-hover:-translate-y-1">
                      {cert.title}
                    </h3>
                    {/* Org — slides up on hover */}
                    <div className="flex items-center gap-2 text-white/0 group-hover:text-white/80 mt-1 max-h-0 group-hover:max-h-10 overflow-hidden transition-all duration-400 ease-out">
                      <div className="w-2 h-2 bg-[var(--btn-primary)] rounded-full flex-shrink-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"></div>
                      <p className="text-sm leading-relaxed">{cert.org}</p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          {(() => {
            // Dots map 1:1 to pageStops so dots and auto-advance stay in sync.
            // Active dot = the one matching currentCertificateIndex.
            const currentPage = pageStops.indexOf(currentCertificateIndex);

            return pageStops.map((targetIndex, pageIndex) => {
              const isActive = pageIndex === currentPage;
              return (
                <button
                  key={pageIndex}
                  onClick={() => {
                    setCurrentCertificateIndex(targetIndex);
                    setIsCertificateCarouselPaused(true);
                    setTimeout(() => setIsCertificateCarouselPaused(false), 4000);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? 'w-8 h-2 bg-[var(--btn-primary)] shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
                      : 'w-2 h-2 bg-slate-300 dark:bg-[var(--border-color)] hover:bg-slate-400 dark:hover:bg-[var(--bg-elevated)]'
                  }`}
                  aria-label={`Ver página ${pageIndex + 1}`}
                />
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
});

CertificatesSection.displayName = 'CertificatesSection';

export default CertificatesSection;

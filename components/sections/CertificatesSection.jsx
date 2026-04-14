'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCertificatesData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';

const CertificatesSection = React.memo(() => {
  const { t } = useTranslation();

  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const [isCertificateCarouselPaused, setIsCertificateCarouselPaused] = useState(false);
  const [isMobileView, setIsMobileView] = useState(true);
  useEffect(() => { setIsMobileView(window.innerWidth < 768); }, []);

  const certificateContainerRef = useRef(null);

  const certificates = useMemo(() => getCertificatesData(t), [t]);

  // Auto-advance certificates carousel with pagination
  useEffect(() => {
    if (!isCertificateCarouselPaused) {
      const interval = setInterval(() => {
        setCurrentCertificateIndex((prev) => {
          const step = isMobileView ? 1 : 2;
          const next = prev + step;
          return next >= certificates.length ? 0 : next;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isCertificateCarouselPaused, certificates.length, isMobileView]);

  // Auto scroll on index change
  useEffect(() => {
    if (certificateContainerRef.current) {
      const container = certificateContainerRef.current;
      const card = container.querySelector('.certificate-card');
      if (card) {
        const cardWidth = card.offsetWidth;
        const computedStyle = window.getComputedStyle(container.querySelector('.flex'));
        const gap = parseInt(computedStyle.gap) || 0;
        const scrollPosition = currentCertificateIndex * (cardWidth + gap);

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentCertificateIndex, isMobileView]);

  // Detect viewport changes to update isMobileView
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="certificates" className="pt-20 bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
      {/* Centered titles */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
          {t('certificates.title')}
        </h2>
      </div>

      {/* Carousel Container - Responsive Grid */}
      <div className="relative w-full mx-auto px-4">
        {/* Scrollable container - Desktop: 2 cards, Mobile: 1 card */}
        <div
          ref={certificateContainerRef}
          className="overflow-x-hidden py-4 scrollbar-hide mx-auto"
          onMouseEnter={() => setIsCertificateCarouselPaused(true)}
          onMouseLeave={() => setIsCertificateCarouselPaused(false)}
          onTouchStart={() => setIsCertificateCarouselPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsCertificateCarouselPaused(false), 2000)}
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maxWidth: isMobileView ? 'min(90vw, 26.25rem)' : 'min(98vw, 87.5rem)'
          }}
        >
          {/* Certificate grid */}
          <div className="flex gap-6">
            {certificates.map((cert, i) => {
              const base = cert.slug;
              return (
              <div
                key={i}
                className="certificate-card flex-shrink-0 bg-white/90 dark:bg-[var(--bg-secondary)] backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-[var(--btn-primary)] transition-all duration-300 transform hover:scale-105 shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:shadow-xl dark:hover:shadow-2xl group cursor-pointer"
                style={{
                  width: isMobileView ? '100%' : 'calc((100% - 24px) / 2)'
                }}
                onClick={() => {
                  setCurrentCertificateIndex(i);
                  setIsCertificateCarouselPaused(true);
                  setTimeout(() => setIsCertificateCarouselPaused(false), 3000);
                }}
              >
                {/* Certificate Image — full card with overlay */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
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
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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

        {/* Navigation dots - Dynamic based on isMobileView */}
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          {(() => {
            const pageSize = isMobileView ? 1 : 2;
            const totalPages = Math.ceil(certificates.length / pageSize);
            const currentPage = Math.floor(currentCertificateIndex / pageSize);

            return Array.from({ length: totalPages }, (_, pageIndex) => {
              const isActive = pageIndex === currentPage;
              const targetIndex = pageIndex * pageSize;

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

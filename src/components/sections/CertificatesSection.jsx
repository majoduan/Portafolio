import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCertificatesData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';

const CertificatesSection = React.memo(() => {
  const { t } = useTranslation();

  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const [isCertificateCarouselPaused, setIsCertificateCarouselPaused] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

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
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
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
            maxWidth: isMobileView ? 'min(90vw, 420px)' : 'min(98vw, 1400px)'
          }}
        >
          {/* Certificate grid */}
          <div className="flex gap-6">
            {certificates.map((cert, i) => (
              <div
                key={i}
                className="certificate-card flex-shrink-0 bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/40 group cursor-pointer"
                style={{
                  width: isMobileView ? '100%' : 'calc((100% - 24px) / 2)'
                }}
                onClick={() => {
                  setCurrentCertificateIndex(i);
                  setIsCertificateCarouselPaused(true);
                  setTimeout(() => setIsCertificateCarouselPaused(false), 3000);
                }}
              >
                {/* Certificate Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  <picture>
                    <source
                      srcSet={`
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-400w.avif 400w,
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-800w.avif 800w,
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-1200w.avif 1200w
                      `}
                      sizes="(max-width: 640px) 400px, 800px"
                      type="image/avif"
                    />
                    <img
                      src={`/images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-800w.webp`}
                      srcSet={`
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-400w.webp 400w,
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-800w.webp 800w,
                        /images/optimized/${cert.image.split('/').pop().replace('.jpg', '').replace('.webp', '')}-1200w.webp 1200w
                      `}
                      sizes="(max-width: 640px) 400px, 800px"
                      alt={cert.title}
                      width="420"
                      height="256"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${cert.icon}</div>`;
                      }}
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900 dark:via-slate-900/20 dark:to-transparent"></div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {cert.title}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <div className="mt-1.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:animate-pulse"></div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {cert.org}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
                      ? 'w-8 h-2 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400'
                      : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
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

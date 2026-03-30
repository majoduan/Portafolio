'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { ExternalLink, Github, Monitor, Server, Maximize } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getProjectsData } from '../../data/projectTranslations';
import { getOptimalVideoSource, getOptimalPoster } from '../../utils/adaptiveVideo';
import { TECH_ICON_MAP } from '../../data/technologies';

// ─── ProjectVideo ────────────────────────────────────────────────────────────
// Autoplay only when in viewport; click to fullscreen
const ProjectVideo = React.memo(({ src, poster, title }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // IntersectionObserver — play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={getOptimalVideoSource(src)}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        aria-label={title}
      />
      {/* Fullscreen hint overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
          <Maximize className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
});

ProjectVideo.displayName = 'ProjectVideo';

// ─── ProjectLinks ─────────────────────────────────────────────────────────────
// Auto-shortens labels when buttons don't fit in a single row.
const ProjectLinks = React.memo(({ links, t, isEven }) => {
  const rowRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const tRef = useRef(t);

  const items = useMemo(() =>
    Object.entries(links).flatMap(([key, value]) => {
      const urls = Array.isArray(value) ? value : [value];
      return urls.map((url, i) => {
        const isDemo = key === 'demo';
        const isFrontend = urls.length > 1 && i === 0;
        const isBackend = urls.length > 1 && i === 1;
        const icon =
          isDemo ? <ExternalLink className="w-5 h-5 text-white" /> :
          isFrontend ? <Monitor className="w-5 h-5 text-white" /> :
          isBackend ? <Server className="w-5 h-5 text-white" /> :
          <Github className="w-5 h-5 text-white" />;
        const fullLabel =
          isDemo ? t('projects.linkLabels.demo') :
          isFrontend ? t('projects.linkLabels.frontend') :
          isBackend ? t('projects.linkLabels.backend') :
          t('projects.linkLabels.github');
        const shortLabel =
          isDemo ? t('projects.linkLabels.demoShort') :
          isFrontend ? t('projects.linkLabels.frontendShort') :
          isBackend ? t('projects.linkLabels.backendShort') :
          t('projects.linkLabels.githubShort');
        return { key: `${key}-${i}`, url, icon, fullLabel, shortLabel };
      });
    }),
    [links, t]
  );

  // Detect wrapping → shorten labels; re-measure CSS vars for hover animation
  useLayoutEffect(() => {
    const langChanged = tRef.current !== t;
    tRef.current = t;
    const row = rowRef.current;
    if (!row) return;

    // On language change, reset to full labels and re-evaluate
    if (langChanged && compact) {
      setCompact(false);
      return;
    }

    // Re-measure swap-btn CSS variables for hover animation
    for (const el of row.querySelectorAll('.swap-btn')) {
      const text = el.querySelector('.swap-btn-text');
      if (text) el.style.setProperty('--swap-text-w', `${text.offsetWidth}px`);
      el.style.setProperty('--swap-btn-w', `${el.offsetWidth}px`);
    }

    // Detect wrapping among buttons only (exclude the LINKS title span)
    const buttons = row.querySelectorAll('.swap-btn');
    if (buttons.length > 1) {
      const firstTop = buttons[0].getBoundingClientRect().top;
      const wraps = Array.from(buttons).some(
        btn => btn.getBoundingClientRect().top > firstTop + 4
      );
      if (!compact && wraps) setCompact(true);
      setIsWrapping(wraps);
    } else {
      setIsWrapping(false);
    }
  }, [compact, items, t]);

  const linksTitle = t('projects.linksTitle');
  const verticalClass = isEven
    ? 'links-title-vertical-right'
    : 'links-title-vertical-left';

  return (
    <div className="flex flex-col gap-1">
      {/* Horizontal title: mobile always; desktop only when wrapping */}
      <span
        className={`text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none ${
          isWrapping ? 'block' : 'block lg:hidden'
        }`}
      >
        {linksTitle}
      </span>

      {/* Button row + vertical title on desktop */}
      <div
        ref={rowRef}
        className={`flex flex-wrap gap-2 items-center ${
          isEven ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Vertical title: desktop only, when buttons fit in one row */}
        {!isWrapping && (
          <span
            className={`hidden lg:flex items-center justify-center px-1 text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none shrink-0 ${verticalClass}`}
          >
            {linksTitle}
          </span>
        )}

        {items.map(({ key, url, icon, fullLabel, shortLabel }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`swap-btn${isEven ? ' swap-btn-reversed' : ''}`}
            aria-label={fullLabel}
          >
            <span className="swap-btn-bg" />
            <span className="swap-btn-icon">{icon}</span>
            <span className="swap-btn-text">{compact ? shortLabel : fullLabel}</span>
          </a>
        ))}
      </div>
    </div>
  );
});

ProjectLinks.displayName = 'ProjectLinks';

// ─── ProjectTech ─────────────────────────────────────────────────────────────
// Tech icon bubbles with vertical "TECH" title (same pattern as ProjectLinks).
const ProjectTech = React.memo(({ techDescriptions, t, isEven }) => {
  const rowRef = useRef(null);
  const [isWrapping, setIsWrapping] = useState(false);

  const techNames = useMemo(() => Object.keys(techDescriptions), [techDescriptions]);

  // Detect wrapping among bubbles (exclude the title span)
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const bubbles = row.querySelectorAll('.tech-bubble');
    if (bubbles.length > 1) {
      const firstTop = bubbles[0].getBoundingClientRect().top;
      const wraps = Array.from(bubbles).some(
        b => b.getBoundingClientRect().top > firstTop + 4
      );
      setIsWrapping(wraps);
    } else {
      setIsWrapping(false);
    }
  }, [techNames]);

  const techTitle = t('projects.techTitle');
  const verticalClass = isEven
    ? 'links-title-vertical-right'
    : 'links-title-vertical-left';

  return (
    <div className="flex flex-col gap-1">
      {/* Horizontal title: mobile always; desktop only when wrapping */}
      <span
        className={`text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none ${
          isWrapping ? 'block' : 'block lg:hidden'
        }`}
      >
        {techTitle}
      </span>

      {/* Bubble row + vertical title on desktop */}
      <div
        ref={rowRef}
        className={`flex flex-wrap gap-2 items-center ${
          isEven ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Vertical title: desktop only, when bubbles fit in one row */}
        {!isWrapping && (
          <span
            className={`hidden lg:flex items-center justify-center px-1 text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none shrink-0 ${verticalClass}`}
          >
            {techTitle}
          </span>
        )}

        {techNames.map((name) => {
          const tech = TECH_ICON_MAP[name];
          if (tech) {
            const IconComp = tech.icon;
            return (
              <div key={name} className="tech-bubble group relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-sm`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {name}
                </span>
              </div>
            );
          }
          return (
            <div key={name} className="tech-bubble group relative">
              <div className="h-10 px-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProjectTech.displayName = 'ProjectTech';

// ─── ProjectRow ───────────────────────────────────────────────────────────────
const ProjectRow = React.memo(({ project, index, t }) => {
  const isEven = index % 2 !== 0; // 0=odd→video left, 1=even→video right
  const poster = getOptimalPoster(project.video);

  return (
    <article id={`project-${project.slug}`} className="relative z-10">
      <div
        className={`flex flex-col lg:flex-row ${isEven ? 'lg:flex-row-reverse' : ''}`}
      >
        {/* Media side — 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col flex-shrink-0">
          {/* Video — preserves 16:9 aspect ratio */}
          <div className="w-full aspect-video bg-black">
            <ProjectVideo
              src={project.video}
              poster={poster}
              title={project.title}
            />
          </div>

          {/* Project Links */}
          <div className={`px-4 py-3 bg-[var(--bg-primary)] transition-colors duration-300 ${isEven ? 'lg:pl-12 xl:pl-16' : 'lg:pr-12 xl:pr-16'}`}>
            <ProjectLinks links={project.links} t={t} isEven={isEven} />
          </div>

          {/* Technologies Used */}
          <div className={`px-4 py-3 bg-[var(--bg-primary)] transition-colors duration-300 ${isEven ? 'lg:pl-12 xl:pl-16' : 'lg:pr-12 xl:pr-16'}`}>
            <ProjectTech techDescriptions={project.techDescriptions} t={t} isEven={isEven} />
          </div>

        </div>

        {/* Info side — 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 lg:px-12 lg:pt-0 lg:pb-12 xl:px-16 xl:pt-0 xl:pb-16">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-5 leading-tight">
            {project.title}
          </h2>

          {/* Overview */}
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-justify">
              {project.longDescription}
            </p>
          </div>


          {/* Key Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {t('projects.keyFeatures')}
            </h3>
            <ul className="space-y-1.5">
              {Object.entries(project.keyFeatures).map(([name, desc]) => (
                <li key={name} className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                  <span className="text-slate-400 dark:text-slate-500">: </span>
                  {desc}
                </li>
              ))}
            </ul>
          </div>



          {/* Technical Implementation */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {t('projects.techImpl')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-justify">
              {project.techImpl}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});

ProjectRow.displayName = 'ProjectRow';

// ─── ProjectsPage ─────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { t } = useTranslation();
  const projects = useMemo(() => getProjectsData(t), [t]);

  // Scroll to hash on mount (for "Dive Deeper" deep links)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    // Small delay to allow page layout to settle
    const timer = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="pt-16">
        {/* Page header */}
        <div className="py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
              {t('projects.pageTitle')}
            </h1>
          </div>
        </div>

        {/* Projects list */}
        <div className="relative z-10">
          {projects.map((project, index) => (
            <React.Fragment key={project.slug}>
              <ProjectRow project={project} index={index} t={t} />
            </React.Fragment>
          ))}
        </div>
    </main>
  );
}

'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { ExternalLink, Github, Monitor, Server, Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getProjectsData } from '../../data/projectTranslations';
import { getOptimalPoster } from '../../utils/adaptiveVideo';
import { TECH_ICON_MAP } from '../../data/technologies';
import ProjectVideo from '../../components/ProjectVideo';

// ─── ProjectLinks ─────────────────────────────────────────────────────────────
// Auto-shortens labels when buttons don't fit in a single row.
const ProjectLinks = React.memo(({ links, t, isEven }) => {
  const rowRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const tRef = useRef(t);

  const items = useMemo(() =>
    Object.entries(links).flatMap(([key, value]) => {
      const urls = Array.isArray(value) ? value : [value];
      return urls.map((url, i) => {
        const isDemo = key === 'demo';
        const isWebsite = key === 'website';
        const isFrontend = urls.length > 1 && i === 0;
        const isBackend = urls.length > 1 && i === 1;
        const icon =
          isDemo ? <ExternalLink className="w-5 h-5 text-white" /> :
          isWebsite ? <Globe className="w-5 h-5 text-white" /> :
          isFrontend ? <Monitor className="w-5 h-5 text-white" /> :
          isBackend ? <Server className="w-5 h-5 text-white" /> :
          <Github className="w-5 h-5 text-white" />;
        const fullLabel =
          isDemo ? t('projects.linkLabels.demo') :
          isWebsite ? t('projects.linkLabels.website') :
          isFrontend ? t('projects.linkLabels.frontend') :
          isBackend ? t('projects.linkLabels.backend') :
          t('projects.linkLabels.github');
        const shortLabel =
          isDemo ? t('projects.linkLabels.demoShort') :
          isWebsite ? t('projects.linkLabels.websiteShort') :
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

    // Detect wrapping among buttons → shorten labels via compact mode
    const buttons = row.querySelectorAll('.swap-btn');
    if (buttons.length > 1) {
      const firstTop = buttons[0].getBoundingClientRect().top;
      const wraps = Array.from(buttons).some(
        btn => btn.getBoundingClientRect().top > firstTop + 4
      );
      if (!compact && wraps) setCompact(true);
    }
  }, [compact, items, t]);

  const linksTitle = t('projects.linksTitle');
  const verticalClass = isEven
    ? 'links-title-vertical-right'
    : 'links-title-vertical-left';

  return (
    <div className="flex flex-col gap-1">
      {/* Horizontal title: mobile only (desktop shows vertical title alongside buttons) */}
      <span className="text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none block lg:hidden">
        {linksTitle}
      </span>

      {/* Desktop: 2-column layout [vertical title | buttons wrap]. Mobile: only buttons wrap (title is lg:flex). */}
      <div className={`flex gap-2 lg:gap-5 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
        {/* Vertical title: desktop only, always shown */}
        <span className={`hidden lg:flex items-center justify-center px-1 text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none shrink-0 self-stretch ${verticalClass}`}>
          {linksTitle}
        </span>

        {/* Buttons wrap inside their own container so row 2 aligns with row 1 */}
        <div
          ref={rowRef}
          className={`flex flex-wrap gap-2 lg:gap-5 items-center min-w-0 ${isEven ? 'lg:flex-row-reverse' : ''}`}
        >
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
    </div>
  );
});

ProjectLinks.displayName = 'ProjectLinks';

// ─── ProjectTech ─────────────────────────────────────────────────────────────
// Tech icon rectangles with vertical "TECH" title (same pattern as ProjectLinks).
const ProjectTech = React.memo(({ techDescriptions, t, isEven }) => {
  const techNames = useMemo(() => Object.keys(techDescriptions), [techDescriptions]);

  const techTitle = t('projects.techTitle');
  const verticalClass = isEven
    ? 'links-title-vertical-right'
    : 'links-title-vertical-left';

  return (
    <div className="flex flex-col gap-1">
      {/* Horizontal title: mobile only (desktop shows vertical title alongside rectangles) */}
      <span className="text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none block lg:hidden">
        {techTitle}
      </span>

      {/* Desktop: 2-column layout [vertical title | rectangles wrap]. Mobile: only rectangles wrap. */}
      <div className={`flex gap-2 md:gap-3 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
        {/* Vertical title: desktop only, always shown */}
        <span className={`hidden lg:flex items-center justify-center px-1 text-sm font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none shrink-0 self-stretch ${verticalClass}`}>
          {techTitle}
        </span>

        {/* Rectangles wrap inside their own container so row 2 aligns with row 1 */}
        <div className={`flex flex-wrap gap-2 md:gap-3 items-center min-w-0 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
          {techNames.map((name) => {
            const tech = TECH_ICON_MAP[name];
            if (tech) {
              const IconComp = tech.icon;
              return (
                <div key={name} className="group relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-black dark:border-white text-black dark:text-white transition-transform duration-300 group-hover:scale-110">
                    <IconComp className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${tech.iconClass || ''}`} />
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">{name}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={name} className="group relative">
                <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-black dark:border-white text-black dark:text-white transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">{name}</span>
                </div>
              </div>
            );
          })}
        </div>
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
    <article id={`project-${project.slug}`} className="relative z-10 scroll-mt-16">
      <div
        className={`flex flex-col lg:flex-row ${isEven ? 'lg:flex-row-reverse' : ''}`}
      >
        {/* Media side — 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col flex-shrink-0">
          {/* Title — above video on mobile/tablet, hidden on desktop */}
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white px-4 pt-6 pb-4 text-center lg:hidden">
            {project.title}
          </h2>

          {/* Video — preserves 16:9 aspect ratio */}
          <div className={`w-full px-3 md:px-4 lg:px-0 ${isEven ? 'lg:pr-[var(--space-sm)]' : 'lg:pl-[var(--space-sm)]'}`}>
            <div className="w-full aspect-video bg-black relative z-10 rounded-lg overflow-hidden">
              <ProjectVideo
                src={project.video}
                poster={poster}
                title={project.title}
              />
            </div>
          </div>

          {/* Project Links */}
          <div className={`px-4 py-3 bg-[var(--bg-primary)] transition-colors duration-300 ${isEven ? 'lg:pl-[var(--space-md)] xl:pl-[var(--space-lg)]' : 'lg:pr-[var(--space-md)] xl:pr-[var(--space-lg)]'}`}>
            <ProjectLinks links={project.links} t={t} isEven={isEven} />
          </div>

          {/* Technologies Used */}
          <div className={`px-4 py-3 bg-[var(--bg-primary)] transition-colors duration-300 ${isEven ? 'lg:pl-[var(--space-md)] xl:pl-[var(--space-lg)]' : 'lg:pr-[var(--space-md)] xl:pr-[var(--space-lg)]'}`}>
            <ProjectTech techDescriptions={project.techDescriptions} t={t} isEven={isEven} />
          </div>

        </div>

        {/* Info side — 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col p-[var(--space-lg)] lg:px-[var(--space-xl)] lg:pt-0 lg:pb-[var(--space-xl)] xl:px-[var(--space-2xl)] xl:pt-0 xl:pb-[var(--space-2xl)]">
          {/* Title — desktop only (mobile/tablet shows it above the video) */}
          <h2 className="hidden lg:block text-2xl md:text-3xl font-bold text-black dark:text-white mb-5 leading-tight">
            {project.title}
          </h2>

          {/* Overview */}
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-pretty hyphens-auto max-w-prose">
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
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-pretty hyphens-auto max-w-prose">
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
    <div className="page-top">
        {/* Page header — opener: gap superior reducido (tight), el page-top da el offset del nav */}
        <div className="section-gap-tight relative z-10">
          <div className="container-page">
            <h1 className="title-glow text-h2 font-bold text-center section-title-mb pb-2 text-black dark:text-white">
              {t('projects.pageTitle')}
            </h1>
          </div>
        </div>

        {/* Projects list — separación entre proyectos = padding interno de cada
            fila (espaciado original, sin gap extra entre filas). */}
        <div className="relative z-10">
          {projects.map((project, index) => (
            <React.Fragment key={project.slug}>
              <ProjectRow project={project} index={index} t={t} />
            </React.Fragment>
          ))}
        </div>
    </div>
  );
}

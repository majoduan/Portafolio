'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { ExternalLink, Github, X, Monitor, Server } from 'lucide-react';
import { getProjectsData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';
import { getOptimalVideoSource, getOptimalPoster } from '../../utils/adaptiveVideo';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import useFocusTrap from '../../hooks/useFocusTrap';

const ModalVideoPlayer = lazy(() => import('../ModalVideoPlayer'));

// Derive card link buttons — one button per URL
const getCardLinks = (links) => {
  const result = [];
  if (links.demo) {
    result.push({ type: 'demo', url: links.demo });
  }
  if (links.github) {
    if (Array.isArray(links.github)) {
      result.push({ type: 'github-frontend', url: links.github[0] });
      result.push({ type: 'github-backend', url: links.github[1] });
    } else {
      result.push({ type: 'github', url: links.github });
    }
  }
  return result;
};

const ProjectCard = React.memo(({ project, onProjectClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => { setIsDesktop(window.innerWidth >= 1024); }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current) videoRef.current.pause();
  }, []);

  const cardLinks = useMemo(() => getCardLinks(project.links), [project.links]);

  const handleLinkClick = useCallback((e, link) => {
    e.stopPropagation();
    window.open(link.url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div
      onClick={() => onProjectClick(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="project-card relative rounded-2xl overflow-hidden cursor-pointer group aspect-video"
    >
      {/* Poster — always visible */}
      <img
        src={getOptimalPoster(project.video)}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* Video — desktop hover only */}
      {isDesktop && isHovered && (
        <video
          ref={videoRef}
          src={getOptimalVideoSource(project.video)}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ contentVisibility: 'auto' }}
        />
      )}

      {/* Bottom gradient overlay — stronger on hover for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300 group-hover:from-black/85 group-hover:via-black/30" />

      {/* Content overlay — title, description, buttons */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3 z-10">
        {/* Text block */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg md:text-xl leading-tight transition-transform duration-300 group-hover:-translate-y-1">
            {project.title}
          </h3>
          {/* Description — slides up on hover */}
          <p className="text-white/0 group-hover:text-white/80 text-sm leading-relaxed mt-1 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-400 ease-out">
            {project.description}
          </p>
        </div>

        {/* Icon buttons — stacked vertically */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {cardLinks.map((link) => {
            const icon =
              link.type === 'demo' ? <ExternalLink className="w-4 h-4" /> :
              link.type === 'github-frontend' ? <Monitor className="w-4 h-4" /> :
              link.type === 'github-backend' ? <Server className="w-4 h-4" /> :
              <Github className="w-4 h-4" />;
            return (
              <button
                key={link.type}
                onClick={(e) => handleLinkClick(e, link)}
                className="w-10 h-10 rounded-full bg-[var(--btn-primary)] flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
                aria-label={link.type}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection = React.memo(() => {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projectsSectionRef = useRef(null);

  const projects = useMemo(() => getProjectsData(t), [t]);
  const { hasIntersected: projectsVisible } = useIntersectionObserver(projectsSectionRef);
  const modalRef = useFocusTrap(isModalOpen);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') handleCloseModal(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, handleCloseModal]);

  const handleProjectClick = useCallback((proj) => {
    setSelectedProject(proj);
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <section ref={projectsSectionRef} id="projects" className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('projects.title')}
          </h2>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projectsVisible ? (
              projects.map((project, i) => (
                <ProjectCard
                  key={i}
                  project={project}
                  onProjectClick={handleProjectClick}
                />
              ))
            ) : (
              projects.map((_project, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden aspect-video bg-[var(--bg-secondary)] animate-pulse"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
            className="project-modal bg-white dark:bg-[var(--bg-secondary)] rounded-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200/80 dark:border-slate-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-[var(--bg-primary-95)] backdrop-blur-lg border-b border-transparent px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white truncate pr-4">
                {selectedProject.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-slate-100 dark:bg-[var(--bg-elevated-50)] hover:bg-slate-200 dark:hover:bg-[var(--bg-elevated)] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="project-modal-content grid grid-cols-1 lg:grid-cols-[66.666%_33.334%] gap-0 h-[calc(90vh-80px)] overflow-hidden">
              <div className="project-modal-video-column bg-slate-50 dark:bg-black lg:h-full flex items-center justify-center overflow-y-auto lg:overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block w-16 h-16 border-4 border-[var(--accent-from-strong)] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{t('projects.loading')}</p>
                    </div>
                  </div>
                }>
                  <ModalVideoPlayer
                    src={selectedProject.video}
                    alt={selectedProject.title}
                  />
                </Suspense>
              </div>

              <div className="project-modal-info-column bg-white dark:bg-[var(--bg-secondary)] p-5 lg:p-7 overflow-y-auto custom-scrollbar">
                {/* Tagline */}
                <div className="mb-4">
                  <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed italic">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-5" />

                {/* About the Project */}
                {selectedProject.longDescription && (
                  <>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                        {t('projects.modalTitle')}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-justify">
                        {selectedProject.longDescription}
                      </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-5" />
                  </>
                )}

                {/* Technologies */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    {t('projects.techUsed')}
                  </h4>
                  <div
                    className="flex flex-wrap gap-2 md:gap-2.5"
                    onMouseMove={(e) => {
                      const tags = e.currentTarget.querySelectorAll('.tech-tag');
                      tags.forEach((tag) => {
                        const rect = tag.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        tag.style.setProperty('--tag-x', `${x}px`);
                        tag.style.setProperty('--tag-y', `${y}px`);
                        tag.style.setProperty('--tag-active', '1');
                      });
                    }}
                    onMouseLeave={(e) => {
                      const tags = e.currentTarget.querySelectorAll('.tech-tag');
                      tags.forEach((tag) => {
                        tag.style.setProperty('--tag-active', '0');
                      });
                    }}
                  >
                    {selectedProject.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="tech-tag px-4 py-1.5 rounded-full text-sm font-medium border border-black dark:border-white text-black dark:text-white cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-5" />

                {/* Project Links */}
                <div className="mb-4 pb-2">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    {t('projects.projectLinks')}
                  </h4>
                  <div className="grid grid-cols-1 min-[1440px]:grid-cols-2 gap-3 pb-1">
                    {Object.entries(selectedProject.links).flatMap(([key, value]) => {
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
                        const label =
                          isDemo ? t('projects.linkLabels.demo') :
                          isFrontend ? t('projects.linkLabels.frontend') :
                          isBackend ? t('projects.linkLabels.backend') :
                          t('projects.linkLabels.github');

                        return (
                          <a
                            key={`${key}-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="swap-btn"
                            ref={(el) => {
                              if (el) {
                                const text = el.querySelector('.swap-btn-text');
                                if (text) el.style.setProperty('--swap-text-w', `${text.offsetWidth}px`);
                                el.style.setProperty('--swap-btn-w', `${el.offsetWidth}px`);
                              }
                            }}
                            aria-label={label}
                          >
                            <span className="swap-btn-bg" />
                            <span className="swap-btn-icon">
                              {icon}
                            </span>
                            <span className="swap-btn-text">
                              {label}
                            </span>
                          </a>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;

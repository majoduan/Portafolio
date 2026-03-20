'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { ExternalLink, Github, X, Code } from 'lucide-react';
import { getProjectsData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';
import { getOptimalVideoSource, getOptimalPoster } from '../../utils/adaptiveVideo';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const ModalVideoPlayer = lazy(() => import('../ModalVideoPlayer'));

// Derive card links: max 2 buttons (demo + github)
// If project has frontend+backend, github opens both
const getCardLinks = (links) => {
  const result = [];
  if (links.demo) {
    result.push({ type: 'demo', urls: [links.demo] });
  }
  const ghUrls = [];
  if (links.github) ghUrls.push(links.github);
  if (links.frontend) ghUrls.push(links.frontend);
  if (links.backend) ghUrls.push(links.backend);
  if (ghUrls.length > 0) {
    result.push({ type: 'github', urls: ghUrls });
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
    link.urls.forEach(url => window.open(url, '_blank', 'noopener,noreferrer'));
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
          {cardLinks.map((link) => (
            <button
              key={link.type}
              onClick={(e) => handleLinkClick(e, link)}
              className="w-10 h-10 rounded-full bg-[var(--btn-primary)] flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              aria-label={link.type}
            >
              {link.type === 'demo'
                ? <ExternalLink className="w-4 h-4" />
                : <Github className="w-4 h-4" />
              }
            </button>
          ))}
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

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

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
          className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            className="project-modal bg-white dark:bg-[var(--bg-secondary)] rounded-3xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-200 dark:border-[var(--accent-border)] shadow-2xl shadow-[var(--accent-glow-strong)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-[var(--bg-primary-95)] backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                {selectedProject.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-[var(--bg-elevated)] rounded-full flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="project-modal-content grid grid-cols-1 lg:grid-cols-[66.666%_33.334%] gap-0 h-[calc(90vh-80px)] overflow-hidden">
              <div className="project-modal-video-column bg-slate-50 dark:bg-black lg:h-full flex items-center justify-center p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">
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

              <div className="project-modal-info-column bg-slate-50 dark:bg-[var(--bg-secondary)] p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.longDescription && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[var(--accent-from)] to-[var(--accent-to)] rounded-full"></div>
                      {t('projects.modalTitle')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify">
                      {selectedProject.longDescription}
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--accent-from)] to-[var(--accent-to)] rounded-full"></div>
                    {t('projects.techUsed')}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="px-4 py-2 bg-white dark:bg-[var(--bg-elevated-70)] backdrop-blur-sm rounded-full text-[var(--accent-solid)] font-medium text-sm border border-red-300 dark:border-[var(--accent-border-subtle)] hover:border-[var(--accent-border)] hover:bg-slate-50 dark:hover:bg-[var(--bg-elevated)] transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--accent-from)] to-[var(--accent-to)] rounded-full"></div>
                    {t('projects.projectLinks')}
                  </h4>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {Object.entries(selectedProject.links).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--accent-from-strong)] to-[var(--accent-to-strong)] hover:from-[var(--accent-from-hover)] hover:to-[var(--accent-to-hover)] rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[var(--accent-glow)]"
                      >
                        <span className="capitalize">{key}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="h-4"></div>
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

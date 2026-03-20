'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { ExternalLink, X, Code } from 'lucide-react';
import { getProjectsData } from '../../data/projectTranslations';
import { useTranslation } from '../../hooks/useTranslation';
import { getOptimalVideoSource, getOptimalPoster } from '../../utils/adaptiveVideo';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const ModalVideoPlayer = lazy(() => import('../ModalVideoPlayer'));

// Componente ProjectCard separado para evitar violar reglas de hooks
// Memoizado para evitar re-renders innecesarios
// OPTIMIZADO v3.0: Desktop=hover-play, Tablet/Mobile=poster only (video en modal)
const ProjectCard = React.memo(({ project, onProjectClick, t }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => { setIsDesktop(window.innerWidth >= 1024); }, []);

  // Pausar video al dejar de hacer hover
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <div
      onClick={() => onProjectClick(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="project-card bg-white/90 dark:bg-slate-900/50 backdrop-blur-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/30 cursor-pointer group"
    >
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-48 flex items-center justify-center relative overflow-hidden">
        {/* Poster siempre visible como base */}
        <img
          src={getOptimalPoster(project.video)}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
        />

        {/* Video solo en desktop y solo durante hover */}
        {isDesktop && isHovered && (
          <video
            ref={videoRef}
            src={getOptimalVideoSource(project.video)}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-300"
            style={{ contentVisibility: 'auto' }}
          />
        )}

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900/80 dark:via-transparent dark:to-transparent" />

        {/* Icono de play al hacer hover (desktop) */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <Code className="w-6 h-6" />
            {t('projects.viewDemo')}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech.map((tech, j) => (
            <span
              key={j}
              className="px-3 py-1 bg-red-50 dark:bg-slate-800 text-xs rounded-full text-red-600 dark:text-blue-400 border border-red-200 dark:border-transparent"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(project.links).map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 dark:hover:from-blue-500 dark:hover:to-purple-500 hover:text-white rounded-full text-sm transition-all duration-300 border border-slate-200 dark:border-transparent"
            >
              <span className="capitalize">{key}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
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

  // Usar intersection observer para cargar videos solo cuando sean visibles
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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t('projects.title')}
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projectsVisible ? (
              projects.map((project, i) => (
                <ProjectCard
                  key={i}
                  project={project}
                  onProjectClick={handleProjectClick}
                  t={t}
                />
              ))
            ) : (
              // Skeleton while section is not visible
              projects.map((project, i) => (
                <div
                  key={i}
                  className="project-card bg-white/90 dark:bg-slate-900/50 backdrop-blur-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg"
                >
                  <div className="bg-gradient-to-br from-blue-600/50 to-purple-600/50 h-48 animate-pulse" />
                  <div className="p-6">
                    <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded mb-3 animate-pulse" />
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal for project videos - Two column layout */}
      {isModalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            className="project-modal bg-white dark:bg-slate-900 rounded-3xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-200 dark:border-blue-500/50 shadow-2xl dark:shadow-blue-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header - Sticky with close button */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {selectedProject.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main container - Two columns on desktop, one on mobile */}
            <div className="project-modal-content grid grid-cols-1 lg:grid-cols-[66.666%_33.334%] gap-0 h-[calc(90vh-80px)] overflow-hidden">
              {/* Left Column - Video (2/3 width, fixed on desktop) */}
              <div className="project-modal-video-column bg-slate-50 dark:bg-black lg:h-full flex items-center justify-center p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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

              {/* Right Column - Info (1/3 width, independent scroll) */}
              <div className="project-modal-info-column bg-slate-50 dark:bg-slate-900 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                {/* Short description */}
                <div className="mb-6">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Long description */}
                {selectedProject.longDescription && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                      {t('projects.modalTitle')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify">
                      {selectedProject.longDescription}
                    </p>
                  </div>
                )}

                {/* Technologies Used */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                    {t('projects.techUsed')}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="px-4 py-2 bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-full text-red-600 dark:text-blue-400 font-medium text-sm border border-red-300 dark:border-blue-500/30 hover:border-red-500 dark:hover:border-blue-500/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project links */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                    {t('projects.projectLinks')}
                  </h4>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {Object.entries(selectedProject.links).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 hover:from-red-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 dark:hover:shadow-blue-500/50"
                      >
                        <span className="capitalize">{key}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Bottom spacing for better scrolling */}
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

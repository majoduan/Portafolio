'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { ExternalLink, Github, Monitor, Server, Maximize, Minimize, Play, Pause, ChevronsLeft, ChevronsRight, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getProjectsData } from '../../data/projectTranslations';
import { getOptimalVideoSource, getOptimalPoster } from '../../utils/adaptiveVideo';
import { TECH_ICON_MAP } from '../../data/technologies';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (s) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

// ─── ProjectVideo ────────────────────────────────────────────────────────────
// Custom YouTube-like player: progress bar, play/pause, skip, volume, fullscreen.
const ProjectVideo = React.memo(({ src, poster, title }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const seekingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── IntersectionObserver — auto-play/pause on scroll ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // ── Fullscreen change listener ──
  useEffect(() => {
    const onChange = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(fs);
      if (fs) resetControlsTimer();
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [resetControlsTimer]);

  // ── Controls auto-hide timer ──
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // ── Request fullscreen on container ──
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }, []);

  // ── Video area click ──
  const handleVideoClick = useCallback(() => {
    if (isFullscreen) {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen]);

  // ── Play / Pause ──
  const handlePlayPause = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  // ── Rewind / Forward ──
  const handleRewind = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const handleForward = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
  }, []);

  // ── Volume ──
  const handleVolumeChange = useCallback((e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  }, []);

  const handleMuteToggle = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      const newVol = volume > 0 ? volume : 0.5;
      video.muted = false;
      video.volume = newVol;
      setVolume(newVol);
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // ── Fullscreen toggle ──
  const handleFullscreenToggle = useCallback((e) => {
    e.stopPropagation();
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // ── Progress bar seek (click) ──
  const handleSeek = useCallback((e) => {
    e.stopPropagation();
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * (video.duration || 0);
  }, []);

  // ── Progress bar drag ──
  const handleProgressDragStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    seekingRef.current = true;

    const onMove = (ev) => {
      const bar = progressBarRef.current;
      const video = videoRef.current;
      if (!bar || !video) return;
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      video.currentTime = ratio * (video.duration || 0);
      setCurrentTime(video.currentTime);
    };

    const onEnd = () => {
      seekingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);

    // Seek to initial click position
    onMove(e);
  }, []);

  // ── Keyboard ──
  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const video = videoRef.current;
      if (video) { if (video.paused) video.play().catch(() => {}); else video.pause(); }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const video = videoRef.current;
      if (video) video.currentTime = Math.max(0, video.currentTime - 10);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const video = videoRef.current;
      if (video) video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    }
  }, []);

  // ── Mouse activity ──
  const handleMouseMove = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleMouseLeave = useCallback(() => {
    if (!isFullscreen) {
      clearTimeout(controlsTimeoutRef.current);
      setShowControls(false);
    }
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className="video-player relative w-full h-full overflow-hidden bg-black"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={handleMouseLeave}
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
        onTimeUpdate={() => { if (!seekingRef.current) setCurrentTime(videoRef.current?.currentTime || 0); }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Click overlay — captures clicks on video area */}
      <div className="absolute inset-0 z-10" onClick={handleVideoClick} />

      {/* Controls overlay */}
      <div
        className={`video-player-controls transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressBarRef}
          className="video-player-progress"
          onClick={handleSeek}
          onMouseDown={handleProgressDragStart}
          onTouchStart={handleProgressDragStart}
        >
          <div className="video-player-progress-filled" style={{ width: `${pct}%` }} />
          <div className="video-player-progress-thumb" style={{ left: `${pct}%` }} />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          {/* Left group */}
          <div className="flex items-center gap-1">
            <button className="video-player-btn" onClick={handleRewind} aria-label="Rewind 10s">
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button className="video-player-btn" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button className="video-player-btn" onClick={handleForward} aria-label="Forward 10s">
              <ChevronsRight className="w-5 h-5" />
            </button>
            <div
              className="video-player-volume-wrapper flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button className="video-player-btn" onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className={`video-player-volume-slider ${showVolumeSlider ? 'video-player-volume-slider-open' : ''}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="video-player-range"
                />
              </div>
            </div>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs select-none tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button className="video-player-btn" onClick={handleFullscreenToggle} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
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
        className={`flex flex-wrap gap-2 lg:gap-5 items-center ${
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
        className={`flex flex-wrap gap-2 md:gap-8 items-center ${
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
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:brightness-125`}>
                  <IconComp className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {name}
                </span>
              </div>
            );
          }
          return (
            <div key={name} className="tech-bubble group relative">
              <div className="h-10 md:h-12 px-3 md:px-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
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
          <div className="w-full aspect-video bg-black relative z-10">
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
          {/* Title — desktop only (mobile/tablet shows it above the video) */}
          <h2 className="hidden lg:block text-2xl md:text-3xl font-bold text-black dark:text-white mb-5 leading-tight">
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

'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize, Play, Pause, ChevronsLeft, ChevronsRight, Volume2, VolumeX } from 'lucide-react';
import { getVideoSources } from '../utils/videoSources';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (s) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

// ─── ProjectVideo ────────────────────────────────────────────────────────────
// Custom YouTube-like player: progress bar, play/pause, skip, volume, fullscreen.
// Shared by the /projects page rows and the Featured Projects modal so both use
// the same controls. Lives in an aspect-video (16:9) container; `object-contain`
// keeps the 16:9 video undistorted in any container.
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
  // Fuentes elegidas en cliente (device + ancho real del reproductor; WebM/AV1
  // primero, MP4 de respaldo). En SSR el <video> solo lleva poster: sin fuentes
  // no hay mismatch de hidratación ni descarga anticipada.
  const [sources, setSources] = useState(null);
  const [inView, setInView] = useState(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Controls auto-hide timer ──
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // ── Elegir fuentes por dispositivo y por ancho renderizado × DPR ──
  useEffect(() => {
    const el = containerRef.current;
    const pick = () => {
      const width = el ? el.getBoundingClientRect().width : 0;
      const dpr = window.devicePixelRatio || 1;
      const next = getVideoSources(src, { displayWidthPx: width * dpr });
      setSources((prev) => (prev && prev[0].src === next[0].src ? prev : next));
    };
    pick();
    let timer;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(pick, 200); };
    window.addEventListener('resize', onResize, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [src]);

  // Cambiar de <source> en caliente exige load() (el navegador no re-evalúa
  // los <source> hijos por sí solo).
  const sourcesKey = sources ? sources[0].src : '';
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourcesKey) return;
    video.load();
  }, [sourcesKey]);

  // ── IntersectionObserver — auto-play/pause on scroll ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourcesKey) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView, sourcesKey]);

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
        poster={poster}
        muted
        loop
        playsInline
        preload={inView ? 'metadata' : 'none'}
        className="w-full h-full object-contain"
        aria-label={title}
        onTimeUpdate={() => {
          if (!seekingRef.current) setCurrentTime(videoRef.current?.currentTime || 0);
          if (duration === 0) {
            const d = videoRef.current?.duration;
            if (d && isFinite(d)) setDuration(d);
          }
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onDurationChange={() => {
          const d = videoRef.current?.duration;
          if (d && isFinite(d)) setDuration(d);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {sources && sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>

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

export default ProjectVideo;

'use client';
import React, { useEffect, useRef } from 'react';
import { sceneSource } from '../../lib/spline/sceneSource';
import { recordSceneLoad } from '../../lib/scenePolicy';

/**
 * SplineScene — usa @splinetool/runtime directamente (sin react-spline).
 *
 * - Arranca desde el ArrayBuffer precargado durante el boot (`app.start`), sin
 *   segunda descarga; si la precarga falló, `app.load(url)` como respaldo.
 * - `paused`: stop()/play() del runtime cuando el hero sale del viewport o la
 *   pestaña se oculta (content-visibility ya evitaba el paint, no el bucle).
 * - Notifica a sceneSource ('ready' | 'failed') para que el boot pueda terminar.
 */
export default function SplineScene({ onLoad, onError, paused = false, className }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  useEffect(() => { onLoadRef.current = onLoad; onErrorRef.current = onError; });

  useEffect(() => {
    let cancelled = false;
    let app = null;
    const t0 = performance.now();

    (async () => {
      try {
        const [{ Application }, buffer] = await Promise.all([
          import('@splinetool/runtime'),
          sceneSource.getBuffer().catch(() => null),
        ]);
        if (cancelled || !canvasRef.current) return;
        app = new Application(canvasRef.current, { renderMode: 'auto' });
        appRef.current = app;
        if (buffer) {
          try {
            // Copia defensiva: si el runtime transfiere el buffer, el original
            // sigue disponible para la próxima navegación SPA.
            await app.start(buffer.slice(0));
          } catch {
            await app.load(sceneSource.url);
          }
        } else {
          await app.load(sceneSource.url);
        }
        if (cancelled) { try { app.dispose(); } catch { /* ignore */ } return; }
        recordSceneLoad(performance.now() - t0);
        sceneSource.release();
        sceneSource.markReady('ready');
        onLoadRef.current?.(app);
      } catch (err) {
        if (cancelled) return;
        sceneSource.markReady('failed');
        onErrorRef.current?.(err);
      }
    })();

    return () => {
      cancelled = true;
      const current = appRef.current;
      appRef.current = null;
      if (current) { try { current.dispose(); } catch { /* ignore */ } }
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    try { if (paused) app.stop(); else app.play(); } catch { /* ignore */ }
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    />
  );
}

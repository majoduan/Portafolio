'use client';
import webmManifest from '../data/webm-manifest.json';
import { getOptimalVideoSource } from './adaptiveVideo';

const WEBM = new Set(webmManifest);

/**
 * Lista de <source> para un vídeo de proyecto: AV1/WebM primero (30–50 % menos
 * bytes en Chrome/Edge/Firefox/Android) y H.264/MP4 como respaldo (Safari).
 * Solo se ofrece el .webm si existe (data/webm-manifest.json, generado por
 * scripts/generate-webm-av1.mjs) para no provocar 404 + reintento.
 *
 * @param {string} mp4Path - ruta original del .mp4
 * @param {{displayWidthPx?: number}} [opts] - ancho renderizado × DPR
 * @returns {{src: string, type: string}[]}
 */
export function getVideoSources(mp4Path, opts = {}) {
  const chosenMp4 = getOptimalVideoSource(mp4Path, opts);
  const base = chosenMp4.split('/').pop().replace(/\.mp4$/, '');
  const sources = [];
  if (WEBM.has(base)) {
    sources.push({ src: chosenMp4.replace(/\.mp4$/, '.webm'), type: 'video/webm; codecs="av01.0.05M.08, opus"' });
  }
  sources.push({ src: chosenMp4, type: 'video/mp4' });
  return sources;
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { useScrollPaint } from '../hooks/useScrollPaint';
import { useReversibleInView } from '../hooks/useReversibleInView';

function TimelineCard({ item, index, isLast, t, registerLogoRef }) {
  const cardRef = useRef(null);
  const inView = useReversibleInView(cardRef);
  const bullets = t(`about.experience.items.${item.key}.bullets`);
  const tag = t(`about.experience.items.${item.key}.tag`);
  const safeTag = tag && !tag.includes('.') ? tag : null;
  const hasMultipleLogos = item.logos.length > 1;
  const mobilePadding = !isLast
    ? (index % 2 === 0 ? 'pr-6 lg:pr-0' : 'pl-6 lg:pl-0')
    : '';

  return (
    <div
      ref={cardRef}
      data-revealed={inView ? 'true' : 'false'}
      style={{ transitionDelay: `${index * 150}ms` }}
      className="timeline-card grid grid-cols-1 lg:grid-cols-[12rem_1fr] lg:gap-12 items-start"
    >
      {/* ── Desktop logos (md+) ── */}
      <div className={`hidden lg:flex ${hasMultipleLogos ? 'flex-row justify-center gap-3' : 'flex-col gap-4'} items-center relative z-10`}>
        {item.logos.map((logo, li) => (
          <div
            key={li}
            ref={el => registerLogoRef(`d-${index}-${li}`, el)}
            className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0"
          >
            <Image src={logo} alt="" width={80} height={80} unoptimized className="w-20 h-20 object-contain" />
          </div>
        ))}
      </div>

      {/* ── Mobile logos (<md) ── */}
      <div className="lg:hidden flex gap-3 mb-4 relative z-10">
        {item.logos.map((logo, li) => (
          <div
            key={li}
            ref={el => registerLogoRef(`m-${index}-${li}`, el)}
            className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0"
          >
            <Image src={logo} alt="" width={56} height={56} unoptimized className="w-10 h-10 md:w-14 md:h-14 object-contain" />
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className={`pt-1 ${mobilePadding}`}>
        {/* Role + period */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 flex-wrap">
          <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">
            {t(`about.experience.items.${item.key}.role`)}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-sm text-slate-500 dark:text-slate-500 whitespace-nowrap">
              {t(`about.experience.items.${item.key}.period`)}
              {item.present && ` – ${t('about.experience.present')}`}
            </span>
            {item.present && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Company + tag | Location */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            {t(`about.experience.items.${item.key}.company`)}
            {safeTag && (
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full ml-2">
                {safeTag}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {t(`about.experience.items.${item.key}.location`)}
            </span>
          </div>
        </div>

        {/* Bullets */}
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex gap-2.5 items-start pl-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black dark:bg-white flex-shrink-0" />
                <span className="text-pretty hyphens-auto">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const SVG_NS = 'http://www.w3.org/2000/svg';
// Radio de las curvas donde una horquilla se abre/cierra sobre el tronco
const FORK_CURVE = 30;

// Los <path> del timeline se crean imperativamente (el número de tramos
// depende de cuántos ítems tienen dos logos), así el SVG no pasa por un
// ciclo de estado → render → medir por cada recálculo.
function createPath(svg, d) {
  const el = document.createElementNS(SVG_NS, 'path');
  el.setAttribute('class', 'work-timeline-path');
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', '2');
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('d', d);
  svg.appendChild(el);
  return el;
}

/**
 * Desktop: un tronco vertical por el centro de la columna de logos. Un ítem
 * con dos logos se abre en horquilla desde el tronco (si hay ítems arriba)
 * y se vuelve a cerrar sobre él (si hay ítems abajo). Devuelve los tramos en
 * orden de pintado: `[{ ds: [d] }]` para tronco, `[{ ds: [dA, dB] }]` para
 * horquillas (ambas ramas se pintan a la vez).
 */
function buildDesktopSegments(positions) {
  const valid = positions.map((ps, i) => (ps.length ? i : -1)).filter((i) => i >= 0);
  if (valid.length < 2) return [];

  const single = valid.find((i) => positions[i].length === 1);
  const first = positions[valid[0]];
  const trunkX = single !== undefined
    ? positions[single][0].cx
    : (first[0].cx + first[1].cx) / 2;

  const segs = [];
  let cursor = null;   // punto donde está el tronco ahora mismo
  let trunkD = null;   // tramo de tronco acumulado y aún no volcado
  let onRails = false; // llegamos a este ítem por raíles rectos desde otro par
  let prevBottom = 0;

  const flushTrunk = (toY) => {
    if (trunkD === null && toY === cursor.y) return; // tramo de longitud cero
    const d = (trunkD ?? `M ${cursor.x} ${cursor.y}`) + ` L ${trunkX} ${toY}`;
    segs.push({ ds: [d] });
    trunkD = null;
  };

  valid.forEach((i, vi) => {
    const ps = positions[i];
    const nextIdx = valid[vi + 1];
    const next = nextIdx !== undefined ? positions[nextIdx] : null;
    const nextTop = next ? Math.min(...next.map((p) => p.top)) : null;

    if (ps.length >= 2) {
      const [a, b] = ps;
      const top = Math.min(a.top, b.top);
      const bottom = Math.max(a.bottom, b.bottom);

      if (cursor && !onRails) {
        // Apertura: el tronco baja hasta splitY y una rama curva hacia cada logo
        const splitY = prevBottom + (top - prevBottom) / 2;
        const r = Math.min(FORK_CURVE, (top - splitY) / 2);
        flushTrunk(splitY);
        const open = (p) => {
          const dir = p.cx < trunkX ? 1 : -1;
          return [
            `M ${trunkX} ${splitY}`,
            `L ${p.cx + dir * r} ${splitY}`,
            `Q ${p.cx} ${splitY} ${p.cx} ${splitY + r}`,
            `L ${p.cx} ${p.cy}`,
          ].join(' ');
        };
        segs.push({ ds: [open(a), open(b)] });
      }
      onRails = false;

      if (next && next.length >= 2) {
        // Dos ítems seguidos con dos logos: raíles rectos logo a logo,
        // sin pellizcar la línea hacia el centro entre ambos.
        const [na, nb] = next;
        segs.push({ ds: [
          `M ${a.cx} ${a.cy} L ${na.cx} ${na.cy}`,
          `M ${b.cx} ${b.cy} L ${nb.cx} ${nb.cy}`,
        ] });
        onRails = true;
        cursor = null;
      } else if (nextTop != null) {
        // Cierre: cada logo baja y se une al tronco en mergeY
        const mergeY = bottom + (nextTop - bottom) / 2;
        const r = Math.min(FORK_CURVE, (mergeY - bottom) / 2);
        const close = (p) => [
          `M ${p.cx} ${p.cy}`,
          `L ${p.cx} ${mergeY - r}`,
          `Q ${p.cx} ${mergeY} ${trunkX} ${mergeY}`,
        ].join(' ');
        segs.push({ ds: [close(a), close(b)] });
        cursor = { x: trunkX, y: mergeY };
      }
      prevBottom = bottom;
    } else {
      const p = ps[0];
      trunkD = cursor
        ? (trunkD ?? `M ${cursor.x} ${cursor.y}`) + ` L ${trunkX} ${p.cy}`
        : `M ${p.cx} ${p.cy}`;
      cursor = { x: trunkX, y: p.cy };
      prevBottom = p.bottom;
    }
  });

  if (trunkD) segs.push({ ds: [trunkD] });
  return segs;
}

/** Mobile: serpentina que pasa por el primer logo de cada ítem. */
function buildSerpentine(centers, containerW) {
  if (centers.length < 2) return null;
  const pad = 12;
  const r = 10;
  const right = containerW - pad;
  const left = pad;
  let d = `M ${centers[0].cx} ${centers[0].cy}`;

  for (let i = 0; i < centers.length - 1; i++) {
    const cy = centers[i].cy;
    const nextCy = centers[i + 1].cy;
    const goRight = i % 2 === 0;

    if (goRight) {
      d += ` L ${right - r} ${cy}`;
      d += ` Q ${right} ${cy} ${right} ${cy + r}`;
      d += ` L ${right} ${nextCy - r}`;
      d += ` Q ${right} ${nextCy} ${right - r} ${nextCy}`;
      d += ` L ${centers[i + 1].cx} ${nextCy}`;
    } else {
      d += ` L ${left + r} ${cy}`;
      d += ` Q ${left} ${cy} ${left} ${cy + r}`;
      d += ` L ${left} ${nextCy - r}`;
      d += ` Q ${left} ${nextCy} ${left + r} ${nextCy}`;
      d += ` L ${centers[i + 1].cx} ${nextCy}`;
    }
  }
  return d;
}

// Muestrea la serpentina con un "coste de scroll" por segmento: las
// horizontales se pintan gradualmente (con su propio presupuesto) y las
// verticales se ponen al día más rápido después.
function sampleSerpentine(el, len, containerH) {
  const numSamples = 200;
  const raw = [];
  for (let i = 0; i <= numSamples; i++) {
    const l = (i / numSamples) * len;
    const p = el.getPointAtLength(l);
    raw.push({ len: l, x: p.x, y: p.y });
  }

  const types = [];
  let totalVY = 0;
  let totalHL = 0;
  for (let i = 1; i < raw.length; i++) {
    const dy = raw[i].y - raw[i - 1].y;
    const dx = raw[i].x - raw[i - 1].x;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isVertical = Math.abs(dy) >= Math.abs(dx);
    if (isVertical) {
      totalVY += Math.abs(dy);
      types.push({ type: 'V', cost: Math.abs(dy) });
    } else {
      totalHL += dist;
      types.push({ type: 'H', cost: dist });
    }
  }

  // alpha = fracción del scroll total dedicada a las horizontales.
  const alpha = 0.28;
  const vBudget = (1 - alpha) * containerH;
  const hBudget = alpha * containerH;

  const samples = [{ len: 0, cumScroll: 0 }];
  let cumScroll = 0;
  for (let i = 1; i < raw.length; i++) {
    const seg = types[i - 1];
    let scrollCost = 0;
    if (seg.type === 'V' && totalVY > 0) {
      scrollCost = (seg.cost / totalVY) * vBudget;
    } else if (seg.type === 'H' && totalHL > 0) {
      scrollCost = (seg.cost / totalHL) * hBudget;
    }
    cumScroll += scrollCost;
    samples.push({ len: raw[i].len, cumScroll });
  }
  return samples;
}

export default function WorkTimeline({ items, t }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const logoRefs = useRef({});
  // Desktop: tramos en orden de pintado { paths, lens, len }
  const segmentsRef = useRef([]);
  const totalLenRef = useRef(0);
  // Mobile: serpentina + muestras {len, cumScroll}
  const serpentineRef = useRef(null);
  const serpentineLenRef = useRef(0);
  const serpentineSamplesRef = useRef(null);
  const containerHeightRef = useRef(0);
  const rafRef = useRef(0);
  const isMdRef = useRef(false);
  const [isMd, setIsMd] = useState(false);
  const [ready, setReady] = useState(false);

  // Stable callback so TimelineCard can register its logo refs into the
  // shared logoRefs map without triggering re-renders.
  const registerLogoRef = useCallback((key, el) => {
    logoRefs.current[key] = el;
  }, []);

  // Keep ref in sync with state
  useEffect(() => { isMdRef.current = isMd; }, [isMd]);

  // ── Media query ──
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsMd(mql.matches);
    isMdRef.current = mql.matches;
    const handler = (e) => { setIsMd(e.matches); isMdRef.current = e.matches; };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // ── Path computation ──
  const computePaths = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    // Container size sin transforms — usamos offsetWidth/offsetHeight para
    // que el calculo del path no dependa del estado transform (reveal animation).
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;

    // Helper: posicion del logo relativa al container, ignorando transforms.
    // getBoundingClientRect() INCLUYE transforms — eso causa mediciones erroneas
    // mientras el reveal animation (`transform: translateY(28px) -> 0`) esta
    // en transicion o pendiente. offsetTop/offsetLeft son layout-only.
    const prefix = isMdRef.current ? 'd' : 'm';
    const getPos = (itemIdx, logoIdx) => {
      const el = logoRefs.current[`${prefix}-${itemIdx}-${logoIdx}`];
      if (!el) return null;

      // Walk offsetParent chain hasta containerRef sumando offsets
      let top = 0;
      let left = 0;
      let cur = el;
      while (cur && cur !== container) {
        top += cur.offsetTop;
        left += cur.offsetLeft;
        cur = cur.offsetParent;
      }
      if (cur !== container) return null; // container no esta en la chain

      const w = el.offsetWidth;
      const h = el.offsetHeight;
      return {
        cx: +(left + w / 2).toFixed(1),
        cy: +(top + h / 2).toFixed(1),
        top: +top.toFixed(1),
        bottom: +(top + h).toFixed(1),
        left: +left.toFixed(1),
        right: +(left + w).toFixed(1),
      };
    };

    svg.replaceChildren();
    segmentsRef.current = [];
    serpentineRef.current = null;

    if (isMdRef.current) {
      const positions = items.map((item, i) =>
        item.logos.map((_, li) => getPos(i, li)).filter(Boolean)
      );
      segmentsRef.current = buildDesktopSegments(positions).map((seg) => ({
        paths: seg.ds.map((d) => createPath(svg, d)),
        lens: [],
        len: 0,
      }));
    } else {
      const centers = items.map((_, i) => getPos(i, 0)).filter(Boolean);
      const d = buildSerpentine(centers, containerW);
      if (d) serpentineRef.current = createPath(svg, d);
    }

    // Measure lengths & init dasharray (cancelable via rafRef)
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const prime = (el) => {
        const len = el.getTotalLength();
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        return len;
      };

      try {
        if (isMdRef.current) {
          let total = 0;
          for (const seg of segmentsRef.current) {
            seg.lens = seg.paths.map(prime);
            seg.len = seg.lens.length ? Math.max(...seg.lens) : 0;
            total += seg.len;
          }
          totalLenRef.current = total;
        } else if (serpentineRef.current) {
          const el = serpentineRef.current;
          const len = prime(el);
          serpentineLenRef.current = len;
          serpentineSamplesRef.current = len > 0 ? sampleSerpentine(el, len, containerH) : null;
        }
      } catch (_) { /* path may not have d yet */ }

      containerHeightRef.current = containerH;
      setReady(true);
      window.dispatchEvent(new Event('scroll'));
    });
  }, [items]);

  // ── ResizeObserver + initial compute ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => computePaths());
    ro.observe(container);
    // Compute after mount (slight delay for layout stabilization)
    const timer = setTimeout(computePaths, 50);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [computePaths, isMd]);

  // ── Scroll-paint callback ──
  const onProgress = useCallback((progress) => {
    if (isMdRef.current) {
      // Desktop: los tramos se pintan en orden; las dos ramas de una
      // horquilla avanzan a la vez.
      const total = totalLenRef.current;
      if (total === 0) return;

      let painted = progress * total;
      for (const seg of segmentsRef.current) {
        const segProg = seg.len > 0 ? Math.max(0, Math.min(painted / seg.len, 1)) : 1;
        for (let k = 0; k < seg.paths.length; k++) {
          seg.paths[k].style.strokeDashoffset = seg.lens[k] * (1 - segProg);
        }
        painted -= seg.len;
      }
    } else {
      // Mobile: each sample carries a "cumScroll" — the scroll-pixel cost
      // accumulated up to that point. Horizontals get their own scroll budget
      // (alpha * containerH), so they paint gradually; verticals get the
      // remainder ((1 - alpha) * containerH), so they paint faster than 1:1
      // and "catch up" after a horizontal.
      const el = serpentineRef.current;
      const len = serpentineLenRef.current;
      const samples = serpentineSamplesRef.current;
      const containerH = containerHeightRef.current;
      if (!el || len === 0 || !samples || containerH === 0) return;

      const isTablet = window.innerWidth >= 768;
      const mobileProgress = Math.min(1, progress * (isTablet ? 1.1 : 1.3));
      const targetScroll = mobileProgress * containerH;

      let lenAtTarget = 0;
      for (let i = 0; i < samples.length; i++) {
        if (samples[i].cumScroll <= targetScroll) {
          lenAtTarget = samples[i].len;
        } else {
          if (i > 0) {
            const dc = samples[i].cumScroll - samples[i - 1].cumScroll;
            if (dc > 0.001) {
              const t = (targetScroll - samples[i - 1].cumScroll) / dc;
              lenAtTarget = samples[i - 1].len + t * (samples[i].len - samples[i - 1].len);
            }
          }
          break;
        }
      }

      el.style.strokeDashoffset = len - lenAtTarget;
    }
  }, []);

  useScrollPaint(containerRef, onProgress);

  // ── Render ──
  return (
    <section className="section-gap relative z-10 bg-transparent">
      <div className="container-prose">
        <h2 className="title-glow text-h2 font-bold text-center section-title-mb pb-2 text-black dark:text-white">
          {t('about.experience.title')}
        </h2>

        <div ref={containerRef} className="relative">
          {/* SVG overlay — draws the timeline line (paths creados en computePaths) */}
          <svg
            ref={svgRef}
            className={`absolute inset-0 w-full h-full pointer-events-none z-[5] text-black dark:text-white transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          />

          <div className="space-y-16">
            {items.map((item, index) => (
              <TimelineCard
                key={item.key}
                item={item}
                index={index}
                isLast={index === items.length - 1}
                t={t}
                registerLogoRef={registerLogoRef}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

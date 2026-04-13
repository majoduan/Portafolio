'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useScrollPaint } from '../hooks/useScrollPaint';

export default function WorkTimeline({ items, t }) {
  const containerRef = useRef(null);
  const logoRefs = useRef({});
  const pathRefs = useRef({});
  const pathLengths = useRef({});
  const pathSamples = useRef({}); // sampled {len, cumScroll} pairs per path (for scroll-cost lookup)
  const containerHeightRef = useRef(0);
  const isMdRef = useRef(false);
  const [isMd, setIsMd] = useState(false);
  const [ready, setReady] = useState(false);

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
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    // Helper: get logo position relative to container
    const prefix = isMdRef.current ? 'd' : 'm';
    const getPos = (itemIdx, logoIdx) => {
      const el = logoRefs.current[`${prefix}-${itemIdx}-${logoIdx}`];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        cx: +(r.left + r.width / 2 - cRect.left).toFixed(1),
        cy: +(r.top + r.height / 2 - cRect.top).toFixed(1),
        top: +(r.top - cRect.top).toFixed(1),
        bottom: +(r.bottom - cRect.top).toFixed(1),
        left: +(r.left - cRect.left).toFixed(1),
        right: +(r.right - cRect.left).toFixed(1),
      };
    };

    if (isMdRef.current) {
      // ── Desktop: fork + trunk ──
      const hasFork = items[0].logos.length > 1;
      const logo1a = getPos(0, 0);
      const logo1b = hasFork ? getPos(0, 1) : null;
      const rest = [];
      for (let i = 1; i < items.length; i++) {
        const p = getPos(i, 0);
        if (p) rest.push(p);
      }

      if (logo1a && rest.length > 0) {
        const trunkX = rest[0].cx;

        if (hasFork && logo1b) {
          const mergeY = logo1a.bottom + (rest[0].top - logo1a.bottom) / 2;
          const curveR = Math.min(30, (mergeY - logo1a.bottom) / 2);

          if (pathRefs.current.leftFork) {
            pathRefs.current.leftFork.setAttribute('d', [
              `M ${logo1a.cx} ${logo1a.cy}`,
              `L ${logo1a.cx} ${mergeY - curveR}`,
              `Q ${logo1a.cx} ${mergeY} ${trunkX} ${mergeY}`,
            ].join(' '));
          }
          if (pathRefs.current.rightFork) {
            pathRefs.current.rightFork.setAttribute('d', [
              `M ${logo1b.cx} ${logo1b.cy}`,
              `L ${logo1b.cx} ${mergeY - curveR}`,
              `Q ${logo1b.cx} ${mergeY} ${trunkX} ${mergeY}`,
            ].join(' '));
          }
          if (pathRefs.current.trunk) {
            let d = `M ${trunkX} ${mergeY}`;
            for (const l of rest) d += ` L ${trunkX} ${l.cy}`;
            pathRefs.current.trunk.setAttribute('d', d);
          }
        } else {
          if (pathRefs.current.trunk) {
            let d = `M ${logo1a.cx} ${logo1a.cy}`;
            for (const l of rest) d += ` L ${trunkX} ${l.cy}`;
            pathRefs.current.trunk.setAttribute('d', d);
          }
          if (pathRefs.current.leftFork) pathRefs.current.leftFork.removeAttribute('d');
          if (pathRefs.current.rightFork) pathRefs.current.rightFork.removeAttribute('d');
        }
      }
    } else {
      // ── Mobile: serpentine ──
      const pad = 12;
      const r = 10;
      const right = cRect.width - pad;
      const left = pad;
      const centers = items.map((_, i) => getPos(i, 0)).filter(Boolean);

      if (centers.length >= 2) {
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

        if (pathRefs.current.serpentine) {
          pathRefs.current.serpentine.setAttribute('d', d);
        }
      }
    }

    // Measure lengths & init dasharray
    requestAnimationFrame(() => {
      const newLengths = {};
      const newSamples = {};
      Object.entries(pathRefs.current).forEach(([key, el]) => {
        if (el) {
          try {
            const len = el.getTotalLength();
            newLengths[key] = len;
            el.style.strokeDasharray = len;
            el.style.strokeDashoffset = len;
            // Sample the path with a per-segment "scroll cost" so horizontals
            // paint gradually (over their own scroll budget) and verticals
            // catch up faster afterward.
            if (key === 'serpentine' && len > 0) {
              const numSamples = 200;
              const raw = [];
              for (let i = 0; i <= numSamples; i++) {
                const l = (i / numSamples) * len;
                const p = el.getPointAtLength(l);
                raw.push({ len: l, x: p.x, y: p.y });
              }

              // Classify each gap as vertical or horizontal and tally totals
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

              // alpha = fraction of total scroll dedicated to horizontals.
              // Higher = horizontals paint slower, verticals catch up faster.
              const alpha = 0.28;
              const containerH = cRect.height;
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
              newSamples[key] = samples;
            }
          } catch (_) { /* path may not have d yet */ }
        }
      });
      pathLengths.current = newLengths;
      pathSamples.current = newSamples;
      containerHeightRef.current = cRect.height;
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
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, [computePaths, isMd]);

  // ── Scroll-paint callback ──
  const onProgress = useCallback((progress) => {
    if (isMdRef.current) {
      // Desktop: paint both forks simultaneously, then trunk
      const leftLen = pathLengths.current.leftFork || 0;
      const rightLen = pathLengths.current.rightFork || 0;
      const trunkLen = pathLengths.current.trunk || 0;
      const forkLen = Math.max(leftLen, rightLen);
      const totalLen = forkLen + trunkLen;
      if (totalLen === 0) return;

      const painted = progress * totalLen;

      // Forks (simultaneous)
      const forkProg = forkLen > 0 ? Math.min(painted / forkLen, 1) : 1;
      if (pathRefs.current.leftFork && leftLen > 0)
        pathRefs.current.leftFork.style.strokeDashoffset = leftLen * (1 - forkProg);
      if (pathRefs.current.rightFork && rightLen > 0)
        pathRefs.current.rightFork.style.strokeDashoffset = rightLen * (1 - forkProg);

      // Trunk (after forks)
      const trunkPainted = Math.max(0, painted - forkLen);
      const trunkProg = trunkLen > 0 ? Math.min(trunkPainted / trunkLen, 1) : 1;
      if (pathRefs.current.trunk && trunkLen > 0)
        pathRefs.current.trunk.style.strokeDashoffset = trunkLen * (1 - trunkProg);
    } else {
      // Mobile: each sample carries a "cumScroll" — the scroll-pixel cost
      // accumulated up to that point. Horizontals get their own scroll budget
      // (alpha * containerH), so they paint gradually; verticals get the
      // remainder ((1 - alpha) * containerH), so they paint faster than 1:1
      // and "catch up" after a horizontal.
      const len = pathLengths.current.serpentine || 0;
      const samples = pathSamples.current.serpentine;
      const containerH = containerHeightRef.current;
      if (len === 0 || !samples || containerH === 0) return;

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

      if (pathRefs.current.serpentine)
        pathRefs.current.serpentine.style.strokeDashoffset = len - lenAtTarget;
    }
  }, []);

  useScrollPaint(containerRef, onProgress);

  // ── Render ──
  return (
    <section className="py-10 relative z-10 bg-transparent transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 pb-2 leading-tight text-black dark:text-white">
          {t('about.experience.title')}
        </h2>

        <div ref={containerRef} className="relative">
          {/* SVG overlay — draws the timeline line */}
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none z-[5] text-black dark:text-white transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          >
            {isMd ? (
              <>
                <path ref={el => { pathRefs.current.leftFork = el; }} className="work-timeline-path" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path ref={el => { pathRefs.current.rightFork = el; }} className="work-timeline-path" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path ref={el => { pathRefs.current.trunk = el; }} className="work-timeline-path" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <path ref={el => { pathRefs.current.serpentine = el; }} className="work-timeline-path" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>

          <div className="space-y-16">
            {items.map((item, index) => {
              const bullets = t(`about.experience.items.${item.key}.bullets`);
              const tag = t(`about.experience.items.${item.key}.tag`);
              const safeTag = tag && !tag.includes('.') ? tag : null;
              const hasMultipleLogos = item.logos.length > 1;
              const isLast = index === items.length - 1;

              // Mobile: add side padding so serpentine vertical doesn't cross text
              const mobilePadding = !isLast
                ? (index % 2 === 0 ? 'pr-6 lg:pr-0' : 'pl-6 lg:pl-0')
                : '';

              return (
                <div
                  key={item.key}
                  className="grid grid-cols-1 lg:grid-cols-[12rem_1fr] lg:gap-12 items-start"
                >
                  {/* ── Desktop logos (md+) ── */}
                  <div className={`hidden lg:flex ${hasMultipleLogos ? 'flex-row justify-center gap-3' : 'flex-col gap-4'} items-center relative z-10`}>
                    {item.logos.map((logo, li) => (
                      <div
                        key={li}
                        ref={el => { logoRefs.current[`d-${index}-${li}`] = el; }}
                        className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0"
                      >
                        <img src={logo} alt="" className="w-20 h-20 object-contain" />
                      </div>
                    ))}
                  </div>

                  {/* ── Mobile logos (<md) ── */}
                  <div className="lg:hidden flex gap-3 mb-4 relative z-10">
                    {item.logos.map((logo, li) => (
                      <div
                        key={li}
                        ref={el => { logoRefs.current[`m-${index}-${li}`] = el; }}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0"
                      >
                        <img src={logo} alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
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
                            <span className="text-justify">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

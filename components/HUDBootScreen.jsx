'use client';
import React, { useState, useEffect, useMemo, memo } from 'react';

// Deterministic PRNG for consistent circuit layout across renders
const createRng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ============================================================
   CIRCUIT GENERATION — multiple path behaviours for variety
   ============================================================ */

// Pattern A: Simple L-shape (1 turn)
const patternL = (sx, sy, cx, cy, rng, reach) => {
  const tx = sx + (cx - sx) * reach;
  const ty = sy + (cy - sy) * reach;
  return rng() > 0.5
    ? [{ x: sx, y: sy }, { x: tx, y: sy }, { x: tx, y: ty }]
    : [{ x: sx, y: sy }, { x: sx, y: ty }, { x: tx, y: ty }];
};

// Pattern B: Zigzag (2-3 turns)
const patternZigzag = (sx, sy, cx, cy, rng, reach) => {
  const pts = [{ x: sx, y: sy }];
  const steps = 2 + Math.floor(rng() * 2);
  let px = sx, py = sy;
  for (let s = 0; s < steps; s++) {
    const t = ((s + 1) / steps) * reach;
    const nx = px + (cx - px) * t;
    const ny = py + (cy - py) * t;
    if (s % 2 === 0) {
      pts.push({ x: nx, y: py });
      pts.push({ x: nx, y: ny });
    } else {
      pts.push({ x: px, y: ny });
      pts.push({ x: nx, y: ny });
    }
    px = nx; py = ny;
  }
  return pts;
};

// Pattern C: Staircase (many short segments)
const patternStaircase = (sx, sy, cx, cy, rng, reach) => {
  const pts = [{ x: sx, y: sy }];
  const steps = 3 + Math.floor(rng() * 3);
  let px = sx, py = sy;
  for (let s = 0; s < steps; s++) {
    const frac = reach / steps;
    const nx = px + (cx - px) * frac;
    const ny = py + (cy - py) * frac;
    pts.push({ x: nx, y: py });
    pts.push({ x: nx, y: ny });
    px = nx; py = ny;
  }
  return pts;
};

// Pattern D: Long straight run then turn toward center
const patternStraightThenTurn = (sx, sy, cx, cy, rng, reach, edge) => {
  const pts = [{ x: sx, y: sy }];
  const runLen = (0.15 + rng() * 0.3);
  // Run parallel to edge first
  if (edge === 0 || edge === 2) {
    const dir = rng() > 0.5 ? 1 : -1;
    const mx = sx + dir * runLen * Math.abs(cx - sx);
    pts.push({ x: mx, y: sy });
    const ty = sy + (cy - sy) * reach;
    pts.push({ x: mx, y: ty });
    const fx = mx + (cx - mx) * reach * 0.5;
    pts.push({ x: fx, y: ty });
  } else {
    const dir = rng() > 0.5 ? 1 : -1;
    const my = sy + dir * runLen * Math.abs(cy - sy);
    pts.push({ x: sx, y: my });
    const tx = sx + (cx - sx) * reach;
    pts.push({ x: tx, y: my });
    const fy = my + (cy - my) * reach * 0.5;
    pts.push({ x: tx, y: fy });
  }
  return pts;
};

// Pattern E: Tree-like branching (returns main path + branch paths)
const patternTree = (sx, sy, cx, cy, rng, reach, isMobile) => {
  const mainPts = patternZigzag(sx, sy, cx, cy, rng, reach);
  const branches = [];
  // Create 1-3 sub-branches from junction points
  const branchCount = isMobile ? 1 : 1 + Math.floor(rng() * 2);
  for (let b = 0; b < branchCount; b++) {
    const ji = 1 + Math.floor(rng() * Math.max(1, mainPts.length - 2));
    const jp = mainPts[Math.min(ji, mainPts.length - 1)];
    const bLen = 20 + rng() * 60;
    const dir = Math.floor(rng() * 4);
    const ex = jp.x + [bLen, -bLen, 0, 0][dir];
    const ey = jp.y + [0, 0, bLen, -bLen][dir];
    branches.push([{ x: jp.x, y: jp.y }, { x: ex, y: ey }]);
    // Sub-sub branch
    if (rng() > 0.5) {
      const sLen = 10 + rng() * 30;
      const sDir = (dir + 1) % 4;
      const sx2 = ex + [sLen, -sLen, 0, 0][sDir];
      const sy2 = ey + [0, 0, sLen, -sLen][sDir];
      branches.push([{ x: ex, y: ey }, { x: sx2, y: sy2 }]);
    }
  }
  return { mainPts, branches };
};

const ORB_RADIUS = 50; // Radius of the central orb (visual size)

// Exclusion zone: bottom area where the INITIALIZING progress bar sits
const isInProgressBarZone = (x, y, w, h) => {
  if (y < h - 60) return false;
  if (w < 1024) return true; // mobile/tablet: entire bottom blocked
  const cx = w / 2;
  return x > cx - 220 && x < cx + 220; // desktop: center 440px
};

const generateCircuits = (w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const rng = createRng(42);
  const isMobile = w < 640;
  const isTablet = w >= 640 && w < 1024;

  // +33% more circuits per view
  const mainCount = isMobile ? 14 : isTablet ? 24 : 35;
  const circuits = [];
  const patterns = [patternL, patternZigzag, patternStaircase, patternStraightThenTurn];

  for (let i = 0; i < mainCount; i++) {
    const edge = i % 4;
    const connectsToOrb = rng() < 0.3;

    let sx, sy;
    switch (edge) {
      case 0: sx = rng() * w * 0.9 + w * 0.05; sy = 0; break;
      case 1: sx = w; sy = rng() * h * 0.9 + h * 0.05; break;
      case 2: sx = rng() * w * 0.9 + w * 0.05; sy = h; break;
      default: sx = 0; sy = rng() * h * 0.9 + h * 0.05; break;
    }

    // Redirect bottom-edge spawns away from progress bar zone
    if (edge === 2 && isInProgressBarZone(sx, sy, w, h)) {
      if (w < 1024) {
        if (sx < cx) { sx = 0; sy = h * 0.7 + (sy / h) * h * 0.25; }
        else { sx = w; sy = h * 0.7 + (sy / h) * h * 0.25; }
      } else {
        sx = sx < cx ? cx - 230 : cx + 230;
      }
    }

    const maxReach = connectsToOrb ? 0.92 + rng() * 0.06 : 0.15 + rng() * 0.45;

    // Use tree pattern ~20% of the time, else cycle through patterns
    const useTree = rng() < 0.2;
    let pts;
    let extraBranches = [];

    if (useTree) {
      const result = patternTree(sx, sy, cx, cy, rng, maxReach, isMobile);
      pts = result.mainPts;
      extraBranches = result.branches;
    } else {
      const patIdx = i % patterns.length;
      const pat = patterns[patIdx];
      pts = pat === patternStraightThenTurn
        ? pat(sx, sy, cx, cy, rng, maxReach, edge)
        : pat(sx, sy, cx, cy, rng, maxReach);
    }

    // If connects to orb: replace final approach with a clean
    // right-angle path that ends in a straight horizontal or vertical
    // line stopping exactly at the orb edge. No diagonals.
    if (connectsToOrb && pts.length >= 2) {
      // Remove any points already inside/near the orb
      while (pts.length > 1 && Math.hypot(pts[pts.length - 1].x - cx, pts[pts.length - 1].y - cy) < ORB_RADIUS * 1.5) {
        pts.pop();
      }
      if (pts.length < 1) pts.push({ x: sx, y: sy });

      const last = pts[pts.length - 1];
      // Decide approach axis: whichever is farther from center
      const dx = Math.abs(last.x - cx);
      const dy = Math.abs(last.y - cy);

      if (dx >= dy) {
        // Approach horizontally: first align Y to center, then go straight H to orb edge
        const orbEdgeX = last.x < cx ? cx - ORB_RADIUS : cx + ORB_RADIUS;
        pts.push({ x: last.x, y: cy }); // vertical move to center Y
        pts.push({ x: orbEdgeX, y: cy }); // horizontal straight into orb
      } else {
        // Approach vertically: first align X to center, then go straight V to orb edge
        const orbEdgeY = last.y < cy ? cy - ORB_RADIUS : cy + ORB_RADIUS;
        pts.push({ x: cx, y: last.y }); // horizontal move to center X
        pts.push({ x: cx, y: orbEdgeY }); // vertical straight into orb
      }
    }

    const startDist = Math.hypot(sx - cx, sy - cy);
    const maxDist = Math.hypot(cx, cy);
    const normDist = 1 - startDist / maxDist;

    circuits.push({
      id: `m${i}`,
      points: pts,
      connectsToOrb,
      activateAt: Math.floor(normDist * 45) + 5,
      delay: normDist * 2.5,
      duration: 0.8 + rng() * 1.4,
    });

    // Add tree branches as separate circuits
    extraBranches.forEach((brPts, bi) => {
      const dur = 0.3 + rng() * 0.4; // always consume rng to preserve sequence
      if (brPts.some(p => isInProgressBarZone(p.x, p.y, w, h))) return;
      circuits.push({
        id: `t${i}-${bi}`,
        points: brPts,
        connectsToOrb: false,
        activateAt: Math.floor(normDist * 45) + 12,
        delay: normDist * 2.5 + 0.6,
        duration: dur,
      });
    });
  }

  // Additional standalone branches from random main circuits
  const branchCount = isMobile ? 8 : isTablet ? 14 : 22;
  for (let i = 0; i < branchCount; i++) {
    const parent = circuits[Math.floor(rng() * Math.min(circuits.length, mainCount))];
    if (parent.points.length < 3) continue;
    const ji = 1 + Math.floor(rng() * (parent.points.length - 2));
    const jp = parent.points[ji];
    const len = 12 + rng() * (isMobile ? 35 : 65);
    const dir = Math.floor(rng() * 4);
    const ex = jp.x + [len, -len, 0, 0][dir];
    const ey = jp.y + [0, 0, len, -len][dir];
    const branchPts = [{ x: jp.x, y: jp.y }, { x: ex, y: ey }];

    // 30% chance of an L-turn sub-branch
    if (rng() > 0.7) {
      const subLen = 10 + rng() * 25;
      const subDir = (dir + (rng() > 0.5 ? 1 : 3)) % 4;
      branchPts.push({
        x: ex + [subLen, -subLen, 0, 0][subDir],
        y: ey + [0, 0, subLen, -subLen][subDir],
      });
    }

    // Skip branches in the progress bar zone (rng calls already consumed)
    if (branchPts.some(p => isInProgressBarZone(p.x, p.y, w, h))) continue;

    circuits.push({
      id: `b${i}`,
      points: branchPts,
      connectsToOrb: false,
      activateAt: parent.activateAt + 6 + Math.floor(rng() * 8),
      delay: parent.delay + 0.3 + rng() * 0.5,
      duration: 0.3 + rng() * 0.5,
    });
  }

  return circuits;
};

// Build SVG path 'd' attribute and total length
const getPathData = (points) => {
  let d = '';
  let length = 0;
  for (let i = 0; i < points.length; i++) {
    d += `${i === 0 ? 'M' : 'L'}${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} `;
    if (i > 0) {
      length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
  }
  return { d, length };
};

/* ============================================================
   COMPONENT
   ============================================================ */

const HUDBootScreen = memo(({ onComplete, splineReady = false }) => {
  const [progress, setProgress] = useState(0);
  const [fadeState, setFadeState] = useState('visible');
  const [orbActive, setOrbActive] = useState(false);
  const [orbIntensity, setOrbIntensity] = useState(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Viewport dimensions
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  // Progress timer
  useEffect(() => {
    const startTime = Date.now();
    const MAX_WAIT = 15000;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeState('fade-out');
          setTimeout(() => onComplete(), 1500);
          return 100;
        }
        if (prev < 85) return prev + 1;
        const elapsed = Date.now() - startTime;
        if (splineReady || elapsed > MAX_WAIT) return prev + 1;
        if (prev < 92) return prev + 0.2;
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete, splineReady]);

  // Orb activation — flicker then ramp up
  useEffect(() => {
    if (progress >= 55 && !orbActive) setOrbActive(true);
  }, [progress, orbActive]);

  useEffect(() => {
    if (!orbActive) return;
    // Phase 1: flicker (rapid random intensity, 0-0.4)
    let frame;
    let elapsed = 0;
    const flickerDuration = 1200; // ms
    const rampDuration = 1000;   // ms
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      elapsed += dt;

      if (elapsed < flickerDuration) {
        // Random flicker between 0.05 and 0.4
        setOrbIntensity(0.05 + Math.random() * 0.35);
      } else if (elapsed < flickerDuration + rampDuration) {
        // Smooth ramp from 0.4 to 1.0
        const rampProgress = (elapsed - flickerDuration) / rampDuration;
        setOrbIntensity(0.4 + rampProgress * 0.6);
      } else {
        setOrbIntensity(1);
        return; // stop
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [orbActive]);

  // No typewriter text — clean boot screen

  // Generate circuits
  const circuits = useMemo(() => {
    if (!dims.w || !dims.h) return [];
    return generateCircuits(dims.w, dims.h);
  }, [dims.w, dims.h]);

  return (
    <div className={`cb cb--${fadeState}`}>
      {/* Circuit traces */}
      <svg className="cb__svg" viewBox={`0 0 ${dims.w} ${dims.h}`} preserveAspectRatio="none">
        {circuits.map(circuit => {
          const { d, length } = getPathData(circuit.points);
          const active = progress >= circuit.activateAt;
          const lastPt = circuit.points[circuit.points.length - 1];
          const showEndDot = !circuit.connectsToOrb;

          return (
            <g key={circuit.id}>
              {/* Glow layer */}
              <path
                d={d} fill="none" stroke="white" strokeWidth={3}
                strokeLinecap="round" strokeLinejoin="round"
                className="cb__trace-glow"
                style={{
                  strokeDasharray: length,
                  strokeDashoffset: active ? 0 : length,
                  opacity: active ? 0.25 : 0,
                  transition: `stroke-dashoffset ${circuit.duration}s ease-out ${circuit.delay}s, opacity 0.4s ease ${circuit.delay}s`,
                }}
              />
              {/* Main trace */}
              <path
                d={d} fill="none" stroke="white" strokeWidth={1.2}
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  strokeDasharray: length,
                  strokeDashoffset: active ? 0 : length,
                  opacity: active ? 0.8 : 0,
                  transition: `stroke-dashoffset ${circuit.duration}s ease-out ${circuit.delay}s, opacity 0.4s ease ${circuit.delay}s`,
                }}
              />
              {/* Junction dots — skip last point for orb-connected circuits */}
              {circuit.points.slice(1, showEndDot ? undefined : -1).map((p, j) => {
                const dotDelay = circuit.delay + circuit.duration * ((j + 1) / circuit.points.length);
                return (
                  <circle key={j} cx={p.x} cy={p.y} r={1.8} fill="white"
                    style={{
                      opacity: active ? 0.45 : 0,
                      transition: `opacity 0.5s ease ${dotDelay}s`,
                    }}
                  />
                );
              })}
              {/* End dot — only for non-orb circuits */}
              {showEndDot && (
                <circle
                  cx={lastPt.x} cy={lastPt.y} r={3} fill="white"
                  style={{
                    opacity: active ? 0.85 : 0,
                    transition: `opacity 0.5s ease ${circuit.delay + circuit.duration}s`,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Central Orb — intensity driven by flicker→ramp animation */}
      <div className="cb__orb" style={{
        '--orb-intensity': orbIntensity,
        '--orb-glow': `${orbIntensity * 30}px`,
        '--orb-glow2': `${orbIntensity * 70}px`,
        '--orb-glow3': `${orbIntensity * 120}px`,
        '--orb-g0': Math.min(1, orbIntensity * 0.95 + Math.pow(orbIntensity, 3) * 0.05),
        '--orb-g1': Math.min(1, orbIntensity * 0.35 + Math.pow(orbIntensity, 3) * 0.65),
        '--orb-g2': Math.min(1, orbIntensity * 0.05 + Math.pow(orbIntensity, 3) * 0.95),
        '--orb-g3': Math.min(1, Math.pow(orbIntensity, 4)),
      }}>
        <div className="cb__orb-core" />
      </div>

      {/* Progress bar */}
      <div className="cb__progress">
        <div className="cb__progress-track">
          <div className="cb__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="cb__progress-label">
          INITIALIZING... {Math.floor(progress)}%
        </span>
      </div>
    </div>
  );
});

HUDBootScreen.displayName = 'HUDBootScreen';
export default HUDBootScreen;

// Renderer canvas 2D del boot screen ("circuit boot").
//
// Reproduce el look del antiguo SVG-en-React (trazos con avance por longitud,
// halo, puntos de unión, orbe con flicker→ramp, barra y etiqueta INITIALIZING)
// pero sin React por frame y sin `filter: blur()` por trazo. Corre igual en un
// Web Worker sobre un OffscreenCanvas (inmune a las tareas largas del hilo
// principal) o, como fallback, en el hilo principal sobre un <canvas> normal.
//
// Sin referencias a `document`/`window` a nivel de módulo (se importa desde el
// worker). Todas las coordenadas se trabajan en px CSS; el transform DPR se
// aplica al dibujar.

import { generateCircuits, pathLength } from './circuits';

// ── Curvas de tiempo CSS replicadas (cubic-bezier) ───────────────────────────
function cubicBezier(x1, y1, x2, y2) {
  const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
  const B = (a1, a2) => 3 * a2 - 6 * a1;
  const C = (a1) => 3 * a1;
  const calc = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      t -= (calc(t, x1, x2) - x) / s;
    }
    return calc(t, y1, y2);
  };
}
const EASE_OUT = cubicBezier(0, 0, 0.58, 1);   // CSS `ease-out`  (stroke-dashoffset)
const EASE = cubicBezier(0.25, 0.1, 0.25, 1);  // CSS `ease`      (opacity)

// Halo del trazo: antes `stroke 3px @ 0.25` + `filter: blur(3px)` por path
// (re-rasterizado cada frame). Aproximación gaussiana en 3 anchos sin filtro:
// energía equivalente (~0.75 px·alpha), pico ≈ 0.12, cola hasta ±6 px.
const GLOW = [
  [12, 0.02],
  [8, 0.04],
  [4, 0.06],
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rgba = (a) => `rgba(255,255,255,${a < 0 ? 0 : a > 1 ? 1 : a})`;

export function createBootRenderer(canvas, options = {}) {
  const reduced = !!options.reducedMotion;
  const onDisplayed = options.onDisplayed;
  const ctx = canvas.getContext('2d', { alpha: false });
  const supportsLetterSpacing = ctx && 'letterSpacing' in ctx;

  let W = 1, H = 1, DPR = 1;
  let circuits = [];
  const active = new Map(); // id -> { at: ms, baked: bool }
  let layer = null;         // capa estática: circuitos completados (dibujados una vez)
  let lctx = null;

  let target = 0;
  let cap = 100;
  let displayed = reduced ? 100 : 0;
  let lastNow = 0;
  let lastReport = -1;
  let orbAt = null;
  let orbLevel = 0;
  let destroyed = false;

  const makeLayer = (w, h) => {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  };

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function activate(t) {
    for (const c of circuits) {
      if (!active.has(c.id) && displayed >= c.activateAt) active.set(c.id, { at: t, baked: false });
    }
  }

  function resize(w, h, dpr) {
    W = Math.max(1, Math.round(w));
    H = Math.max(1, Math.round(h));
    DPR = dpr || 1;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    layer = makeLayer(canvas.width, canvas.height);
    lctx = layer.getContext('2d');
    circuits = reduced ? [] : generateCircuits(W, H).map((c) => ({ ...c, len: pathLength(c.points) }));
    active.clear();
    // Igual que el useMemo por dims del SVG: los circuitos ya "activos" vuelven
    // a animarse desde el inicio tras un resize.
    activate(now());
  }

  // ── Dibujo de un circuito en el instante `t` (ms). Devuelve true si terminó. ──
  function tracePath(g, c) {
    const p = c.points;
    g.beginPath();
    g.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) g.lineTo(p[i].x, p[i].y);
  }

  function dot(g, p, r, a) {
    if (a <= 0) return;
    g.fillStyle = rgba(a);
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.fill();
  }

  function drawCircuit(g, c, tNow) {
    const s = active.get(c.id);
    if (!s) return false;
    const t = (tNow - s.at) / 1000 - c.delay; // segundos desde el inicio de la transición
    if (t <= 0) return false;

    const k = EASE_OUT(clamp01(t / c.duration));
    const op = EASE(clamp01(t / 0.4));
    const vis = c.len * k;

    g.lineCap = 'round';
    g.lineJoin = 'round';
    tracePath(g, c);
    g.setLineDash([vis, c.len + 2]);
    g.lineDashOffset = 0;
    for (let i = 0; i < GLOW.length; i++) {
      g.lineWidth = GLOW[i][0];
      g.strokeStyle = rgba(GLOW[i][1] * op);
      g.stroke();
    }
    g.lineWidth = 1.2;
    g.strokeStyle = rgba(0.8 * op);
    g.stroke();
    g.setLineDash([]);

    // Puntos de unión (delay proporcional a la posición) y punto final
    const n = c.points.length;
    const showEnd = !c.connectsToOrb;
    const lastIdx = showEnd ? n : n - 1;
    for (let j = 1; j < lastIdx; j++) {
      const td = t - c.duration * (j / n);
      if (td <= 0) continue;
      dot(g, c.points[j], 1.8, 0.45 * EASE(clamp01(td / 0.5)));
    }
    if (showEnd) {
      const td = t - c.duration;
      if (td > 0) dot(g, c.points[n - 1], 3, 0.85 * EASE(clamp01(td / 0.5)));
    }
    return t >= c.duration + 0.55;
  }

  // ── Orbe central ─────────────────────────────────────────────────────────
  function updateOrb(tNow) {
    if (reduced) { orbLevel = 1; return; }
    if (orbAt == null) {
      if (displayed >= 35) orbAt = tNow; else { orbLevel = 0; return; }
    }
    const e = tNow - orbAt;
    if (e < 700) orbLevel = 0.05 + Math.random() * 0.35;          // flicker
    else if (e < 1200) orbLevel = 0.4 + ((e - 700) / 500) * 0.6;  // ramp
    else orbLevel = 1;
  }

  function drawOrb(g) {
    const i = orbLevel;
    if (i <= 0) return;
    const size = W <= 768 ? 72 : 100;
    const R = size / 2;
    const cx = W / 2, cy = H / 2;
    const i3 = i * i * i;

    // box-shadows (de fuera hacia dentro): 0 0 (i*120) @ i*0.1 | (i*70) @ i*0.3 | (i*30) @ i*0.7
    const shadows = [[120 * i, i * 0.1], [70 * i, i * 0.3], [30 * i, i * 0.7]];
    for (const [blur, a] of shadows) {
      if (blur < 0.5 || a <= 0) continue;
      const inner = Math.max(0, R - blur / 2);
      const outer = R + blur;
      const grad = g.createRadialGradient(cx, cy, inner, cx, cy, outer);
      grad.addColorStop(0, rgba(a));
      grad.addColorStop(0.45, rgba(a * 0.45));
      grad.addColorStop(1, rgba(0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, outer, 0, Math.PI * 2);
      g.fill();
    }

    // Núcleo: radial-gradient 0% g0 | 40% g1 | 70% g2 | 100% g3
    const g0 = Math.min(1, i * 0.95 + i3 * 0.05);
    const g1 = Math.min(1, i * 0.35 + i3 * 0.65);
    const g2 = Math.min(1, i * 0.05 + i3 * 0.95);
    const g3 = Math.min(1, i * i * i * i);
    const core = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    core.addColorStop(0, rgba(g0));
    core.addColorStop(0.4, rgba(g1));
    core.addColorStop(0.7, rgba(g2));
    core.addColorStop(1, rgba(g3));
    g.fillStyle = core;
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.fill();

    // Borde: 1px @ i*(1-i)*1.2 (solo visible a media intensidad)
    const ba = i * (1 - i) * 1.2;
    if (ba > 0.005) {
      g.lineWidth = 1;
      g.strokeStyle = rgba(ba);
      g.beginPath();
      g.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      g.stroke();
    }
  }

  // ── Barra de progreso + etiqueta ─────────────────────────────────────────
  function drawProgress(g) {
    const bw = Math.min(400, W - 40);
    const x = (W - bw) / 2;
    const trackY = H - 52; // bottom:30px + label(≈12px) + gap 8px + track 2px
    g.fillStyle = rgba(0.08);
    g.fillRect(x, trackY, bw, 2);

    const fillW = (bw * clamp01(displayed / 100));
    if (fillW > 0) {
      g.save();
      g.shadowColor = rgba(0.4);
      g.shadowBlur = 8;
      g.fillStyle = rgba(0.8);
      g.fillRect(x, trackY, fillW, 2);
      g.restore();
    }

    const label = `INITIALIZING... ${Math.floor(displayed)}%`;
    g.fillStyle = rgba(0.3);
    g.font = '10px "Courier New", monospace';
    g.textBaseline = 'top';
    const labelY = trackY + 2 + 8;
    if (supportsLetterSpacing) {
      g.letterSpacing = '3px';
      const wText = g.measureText(label).width;
      g.textAlign = 'left';
      g.fillText(label, (W - wText) / 2, labelY);
      g.letterSpacing = '0px';
    } else {
      // Fallback: espaciado manual de 3px entre caracteres
      let total = 0;
      const widths = [];
      for (const ch of label) { const wch = g.measureText(ch).width; widths.push(wch); total += wch + 3; }
      let cx = (W - total) / 2;
      g.textAlign = 'left';
      let idx = 0;
      for (const ch of label) { g.fillText(ch, cx, labelY); cx += widths[idx++] + 3; }
    }
  }

  // ── Frame ────────────────────────────────────────────────────────────────
  function frame(tNow) {
    if (destroyed || !ctx) return;
    const dt = lastNow ? Math.min(0.1, (tNow - lastNow) / 1000) : 0;
    lastNow = tNow;

    if (!reduced) {
      if (displayed < target) {
        // Alcanza el objetivo real deprisa (≥25 %/s, ≤60 %/s), sin teletransporte
        const speed = Math.max(25, Math.min(60, (target - displayed) * 5));
        displayed = Math.min(target, displayed + speed * dt);
      } else if (displayed < cap) {
        // Sin nuevo hito: se acerca asintóticamente al tope del tramo (nunca lo alcanza)
        displayed = Math.min(cap, displayed + (cap - displayed) * 0.6 * dt);
      }
    }

    activate(tNow);
    updateOrb(tNow);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (layer) ctx.drawImage(layer, 0, 0, W, H);

    for (const c of circuits) {
      const s = active.get(c.id);
      if (!s || s.baked) continue;
      const done = drawCircuit(ctx, c, tNow);
      if (done && lctx) {
        lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        drawCircuit(lctx, c, tNow);
        s.baked = true;
      }
    }

    drawOrb(ctx);
    drawProgress(ctx);

    if (onDisplayed && tNow - lastReport > 100) {
      lastReport = tNow;
      onDisplayed(displayed);
    }
  }

  function setProgress(nextTarget, nextCap) {
    if (typeof nextTarget === 'number') target = Math.max(target, Math.min(100, nextTarget));
    if (typeof nextCap === 'number') cap = Math.max(target, Math.min(100, nextCap));
  }

  function destroy() {
    destroyed = true;
    active.clear();
    circuits = [];
    layer = null;
    lctx = null;
  }

  resize(options.width || 1, options.height || 1, options.dpr || 1);
  if (reduced) target = cap = displayed = 100;

  return { frame, resize, setProgress, destroy };
}

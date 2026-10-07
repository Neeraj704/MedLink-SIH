"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type Vec = [number, number, number];
type Point = { end: Vec; start: Vec; cluster: number; delay: number; size: number };

const SURFACE = 560;
const CORE = 96;
const CLUSTER_DIRS: Vec[] = [
  [-0.78, 0.42, 0.46],
  [0.82, 0.36, 0.44],
  [0.04, -0.86, 0.5],
];
const MAX_TILT = (12 * Math.PI) / 180;

function normalize(v: Vec): Vec {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildPoints() {
  const rand = seeded(42);
  const dirs = CLUSTER_DIRS.map(normalize);
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < SURFACE; i++) {
    const y = 1 - (i / (SURFACE - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const end: Vec = [Math.cos(theta) * r, y, Math.sin(theta) * r];
    let best = 0;
    let bestDot = -Infinity;
    dirs.forEach((d, k) => {
      const dot = d[0] * end[0] + d[1] * end[1] + d[2] * end[2];
      if (dot > bestDot) {
        bestDot = dot;
        best = k;
      }
    });
    const spread = 2.2 + rand() * 2.4;
    const start: Vec = normalize([rand() - 0.5, rand() - 0.5, rand() - 0.5]).map((c) => c * spread) as Vec;
    points.push({ end, start, cluster: best, delay: rand() * 0.28, size: 1 + rand() * 0.9 });
  }
  for (let i = 0; i < CORE; i++) {
    const d = normalize([rand() - 0.5, rand() - 0.5, rand() - 0.5]);
    const rr = 0.08 + Math.cbrt(rand()) * 0.26;
    const start: Vec = d.map((c) => c * (2.5 + rand() * 2)) as Vec;
    points.push({ end: [d[0] * rr, d[1] * rr, d[2] * rr], start, cluster: 3, delay: 0.1 + rand() * 0.3, size: 1.1 + rand() * 1.2 });
  }
  const links: [number, number][] = [];
  for (let i = 0; i < SURFACE; i++) {
    const a = points[i].end;
    const near: { j: number; d: number }[] = [];
    for (let j = i + 1; j < SURFACE; j++) {
      const b = points[j].end;
      const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      if (d < 0.028) near.push({ j, d });
    }
    near.sort((x, y) => x.d - y.d);
    near.slice(0, 2).forEach((n) => links.push([i, n.j]));
  }
  return { points, links, dirs };
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function RosettaOrb({ reduce, className }: { reduce: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { points, links, dirs } = buildPoints();
    const defaultColors = [
      isDark ? "#30d158" : "#34c759",
      "#ff9f0a",
      isDark ? "#bf5af2" : "#af52de",
      "#0a84ff",
    ];
    const styles = getComputedStyle(canvas);
    const colors = ["--ayurveda", "--siddha", "--unani", "--icd"].map(
      (v, i) => styles.getPropertyValue(v).trim() || defaultColors[i],
    );

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let rotY = 0.6;
    let tiltX = 0;
    let tiltY = 0;
    let targetX = 0;
    let targetY = 0;
    startRef.current ??= performance.now();
    const startTime = startRef.current;
    let last = startTime;
    let running = false;
    let frame = 0;
    const projected = new Float32Array((SURFACE + CORE) * 4);
    const order = points.map((_, i) => i);

    const project = (v: Vec, out: number, cx: number, cy: number, scale: number) => {
      const cosY = Math.cos(rotY + tiltY);
      const sinY = Math.sin(rotY + tiltY);
      const x1 = v[0] * cosY - v[2] * sinY;
      const z1 = v[0] * sinY + v[2] * cosY;
      const cosX = Math.cos(tiltX - 0.18);
      const sinX = Math.sin(tiltX - 0.18);
      const y2 = v[1] * cosX - z1 * sinX;
      const z2 = v[1] * sinX + z1 * cosX;
      const denom = 3.2 + z2;
      const persp = denom > 0.15 ? 3.2 / denom : 0.15;
      projected[out] = cx + x1 * scale * persp;
      projected[out + 1] = cy + y2 * scale * persp;
      projected[out + 2] = z2;
      projected[out + 3] = Math.max(0.01, persp);
    };

    const draw = (now: number) => {
      try {
        const dt = Math.min(64, now - last);
        last = now;
        const t = reduce ? 1 : Math.min(1, (now - startTime) / 1800);
        if (!reduce) {
          rotY += dt * 0.00011;
          tiltX += (targetX - tiltX) * 0.06;
          tiltY += (targetY - tiltY) * 0.06;
        }
        if (width === 0 || height === 0) {
          resize();
          if (width === 0 || height === 0) return;
        }
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.38;

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const local = Math.max(0, Math.min(1, (t * 1.35 - p.delay) / 1));
          const e = easeOutExpo(local);
          const v: Vec = [
            p.start[0] + (p.end[0] - p.start[0]) * e,
            p.start[1] + (p.end[1] - p.start[1]) * e,
            p.start[2] + (p.end[2] - p.start[2]) * e,
          ];
          project(v, i * 4, cx, cy, scale);
        }

        if (t > 0.45) {
          const linkAlpha = Math.min(1, (t - 0.45) / 0.5);
          ctx.lineWidth = 0.6;
          for (const [a, b] of links) {
            const za = projected[a * 4 + 2];
            const depth = 1 - (za + 1) / 2;
            ctx.globalAlpha = (0.05 + depth * 0.16) * linkAlpha;
            ctx.strokeStyle = colors[points[a].cluster];
            ctx.beginPath();
            ctx.moveTo(projected[a * 4], projected[a * 4 + 1]);
            ctx.lineTo(projected[b * 4], projected[b * 4 + 1]);
            ctx.stroke();
          }
        }

        order.sort((a, b) => projected[b * 4 + 2] - projected[a * 4 + 2]);
        for (const i of order) {
          const z = projected[i * 4 + 2];
          const persp = Math.max(0.01, projected[i * 4 + 3]);
          const depth = 1 - (z + 1) / 2;
          const p = points[i];
          ctx.globalAlpha = p.cluster === 3 ? 0.55 + depth * 0.45 : 0.22 + depth * 0.72;
          ctx.fillStyle = colors[p.cluster];
          ctx.beginPath();
          const r = Math.max(0.1, p.size * persp * (p.cluster === 3 ? 1.5 : 1.25));
          ctx.arc(projected[i * 4], projected[i * 4 + 1], r, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!reduce && t >= 1) {
          const cycle = 3200;
          const phase = ((now - startTime) % cycle) / cycle;
          const k = Math.floor((now - startTime) / cycle) % 3;
          if (phase < 0.55) {
            const prog = easeOutExpo(phase / 0.55);
            const d = dirs[k];
            const from: Vec = [d[0], d[1], d[2]];
            const pos: Vec = [from[0] * (1 - prog), from[1] * (1 - prog), from[2] * (1 - prog)];
            const idx = (SURFACE + CORE - 1) * 4;
            const saved = [projected[idx], projected[idx + 1], projected[idx + 2], projected[idx + 3]];
            project(from, idx, cx, cy, scale);
            const fx = projected[idx];
            const fy = projected[idx + 1];
            project(pos, idx, cx, cy, scale);
            const px = projected[idx];
            const py = projected[idx + 1];
            projected.set(saved, idx);
            const grad = ctx.createLinearGradient(fx, fy, px, py);
            grad.addColorStop(0, `${colors[k]}00`);
            grad.addColorStop(1, colors[k]);
            ctx.globalAlpha = 0.9 * (1 - prog * 0.4);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = colors[k];
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      } catch (err) {
        console.error("[RosettaOrb] render error:", err);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (!running) {
        running = true;
        last = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    const onPointer = (e: PointerEvent) => {
      targetY = (e.clientX / window.innerWidth - 0.5) * 2 * MAX_TILT;
      targetX = (e.clientY / window.innerHeight - 0.5) * 2 * MAX_TILT;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      resize();
      if (width > 0 && height > 0) {
        if (!reduce) {
          startLoop();
        }
        draw(performance.now());
      }
    });
    ro.observe(canvas);

    let io: IntersectionObserver | null = null;
    if (reduce) {
      draw(performance.now());
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      io = new IntersectionObserver(([entry]) => {
        const isVisible = entry.isIntersecting && document.visibilityState === "visible";
        if (isVisible) {
          startLoop();
        } else if (
          !entry.isIntersecting &&
          entry.boundingClientRect.width > 0 &&
          entry.boundingClientRect.height > 0
        ) {
          stopLoop();
        }
      });
      io.observe(canvas);
      startLoop();
      draw(performance.now());
    }

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce, isDark]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

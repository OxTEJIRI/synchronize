import { useEffect, useRef } from "react";
import { energyCopy } from "../copy/content";
import { coreIds, FOUNDING_IDS } from "../state/simulation";
import { onTransfers } from "../state/store";
import type { Actor, Stress } from "../state/types";
import { RESERVE_ID } from "../state/types";

// Same values as the tokens in tokens.css; canvas cannot read CSS variables cheaply.
const IDLE: [number, number, number] = [0x2a, 0x27, 0x1f];
const GOLD: [number, number, number] = [0xc4, 0xa3, 0x5a];
const GOLD_HOT = "#E0C57A";
const DANGER: [number, number, number] = [0xb5, 0x6a, 0x3a];
const DANGER_CSS = "#B56A3A";
const CREAM = "#E8DCBA";
const CREAM_DIM = "rgba(232, 220, 186, 0.62)";
const LINE = "rgba(232, 220, 186, 0.12)";
const LINE_STRONG = "rgba(232, 220, 186, 0.28)";

const MAX_PARTICLES = 80;

interface Particle {
  from: string;
  to: string;
  start: number;
  dur: number;
}

interface Props {
  actors: Actor[];
  reserve: number;
  stresses: Record<Stress, boolean>;
}

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function NodeField({ actors, reserve, stresses }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const actorsRef = useRef(actors);
  const reserveRef = useRef(reserve);
  actorsRef.current = actors;
  reserveRef.current = reserve;
  const stressRef = useRef(stresses);
  stressRef.current = stresses;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pos = new Map<string, { x: number; y: number }>();
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const off = onTransfers((ts) => {
      if (reduced.matches) return;
      const now = performance.now();
      for (const t of ts) {
        const n = Math.min(8, Math.max(1, Math.round(t.amount * 4)));
        for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
          particles.push({
            from: t.from,
            to: t.to,
            start: now + i * 90 + Math.random() * 200,
            dur: 1800 + Math.random() * 900,
          });
        }
      }
    });

    const draw = (now: number) => {
      const list = actorsRef.current;
      const m = Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;
      const reserveR = m * 0.13;

      // Target layout: YOU at centre, everyone else on two loose rings.
      const st = stressRef.current;
      const others = list.filter((a) => !a.isYou && !a.isGhost);
      const inner = others.filter((_, i) => i % 2 === 0);
      const outer = others.filter((_, i) => i % 2 === 1);
      const target = new Map<string, { x: number; y: number }>();
      target.set(list.find((a) => a.isYou)?.id ?? "you", { x: cx, y: cy });
      list
        .filter((a) => a.isGhost)
        .forEach((g, k, all) => {
          const ang = Math.PI / 2 + (k - (all.length - 1) / 2) * 0.9;
          target.set(g.id, { x: cx + Math.cos(ang) * 34, y: cy + Math.sin(ang) * 34 });
        });
      const place = (group: Actor[], radius: number, phase: number) =>
        group.forEach((a, k) => {
          const j = hash(a.id);
          const ang = phase + (k / group.length) * Math.PI * 2 + (j - 0.5) * 0.22;
          const rr = m * (radius + (hash(a.id + "r") - 0.5) * 0.04);
          target.set(a.id, { x: cx + Math.cos(ang) * rr * 1.35, y: cy + Math.sin(ang) * rr });
        });
      place(inner, 0.27, -Math.PI / 2);
      place(outer, 0.41, -Math.PI / 2 + 0.3);

      for (const [id, t] of target) {
        const p = pos.get(id);
        if (!p) pos.set(id, reduced.matches ? { ...t } : { x: cx, y: cy });
        else if (reduced.matches) {
          p.x = t.x;
          p.y = t.y;
        } else {
          p.x += (t.x - p.x) * 0.1;
          p.y += (t.y - p.y) * 0.1;
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Reserve ring.
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = LINE_STRONG;
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, reserveR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = CREAM_DIM;
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText(energyCopy.reserveShort(reserveRef.current), cx, cy - reserveR - 8);

      // Anchor for a transfer endpoint; the reserve is a ring, so aim at the side facing the other end.
      const anchor = (id: string, other: string) => {
        if (id !== RESERVE_ID) return pos.get(id);
        const o = pos.get(other) ?? { x: cx, y: cy - 1 };
        let dx = o.x - cx;
        let dy = o.y - cy;
        const len = Math.hypot(dx, dy);
        if (len < 1) {
          dx = 0;
          dy = -1;
        } else {
          dx /= len;
          dy /= len;
        }
        return { x: cx + dx * reserveR, y: cy + dy * reserveR };
      };

      // Nodes.
      const core = st.capture ? coreIds(list) : [];
      for (const a of list) {
        const p = pos.get(a.id);
        if (!p) continue;
        if (a.isGhost) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 + 1.5 * Math.sqrt(a.energy), 0, Math.PI * 2);
          ctx.strokeStyle = DANGER_CSS;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
          continue;
        }
        const r = (a.isYou ? 4 : 3) + 2.2 * Math.sqrt(Math.max(0, a.energy)) * (a.isYou ? 1.15 : 1);
        const t = Math.min(1, Math.max(0, a.activity));
        const tint = a.fork && st.fork ? 0.6 : 0;
        const fill = a.isYou
          ? GOLD_HOT
          : `rgb(${mix(mix(IDLE[0], GOLD[0], t), DANGER[0], tint) | 0}, ${mix(mix(IDLE[1], GOLD[1], t), DANGER[1], tint) | 0}, ${mix(mix(IDLE[2], GOLD[2], t), DANGER[2], tint) | 0})`;
        ctx.globalAlpha = st.flatten ? 0.5 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = a.isYou ? GOLD_HOT : LINE_STRONG;
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (core.includes(a.id)) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = DANGER_CSS;
          ctx.stroke();
        }
        if (st.architects && FOUNDING_IDS.includes(a.id)) {
          ctx.beginPath();
          ctx.setLineDash([2, 3]);
          ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = GOLD_HOT;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (a.isYou) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = LINE_STRONG;
          ctx.stroke();
        }
        ctx.fillStyle = a.isYou ? CREAM : CREAM_DIM;
        ctx.font = a.isYou
          ? '500 11px "IBM Plex Sans", sans-serif'
          : '10px "IBM Plex Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(
          a.isYou ? energyCopy.you(a.name).toUpperCase() : st.flatten ? "◦" : a.name,
          p.x,
          p.y + r + (a.isYou ? 22 : 13),
        );
      }

      // Particles: loser -> winner.
      particles = particles.filter((q) => now < q.start + q.dur);
      for (const q of particles) {
        if (now < q.start) continue;
        const a = anchor(q.from, q.to);
        const b = anchor(q.to, q.from);
        if (!a || !b) continue;
        const u = (now - q.start) / q.dur;
        const e = u * u * (3 - 2 * u);
        ctx.beginPath();
        ctx.arc(mix(a.x, b.x, e), mix(a.y, b.y, e), 2, 0, Math.PI * 2);
        ctx.fillStyle = GOLD_HOT;
        ctx.globalAlpha = 1 - Math.abs(u - 0.5) * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Faint hub guides.
      ctx.strokeStyle = LINE;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div className="field-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={energyCopy.fieldLabel} />
    </div>
  );
}

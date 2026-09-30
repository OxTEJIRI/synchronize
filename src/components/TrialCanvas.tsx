import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { actI, actIStrings, common } from "../copy/content";
import type { Era } from "../state/types";
import { HairlineButton } from "./primitives";

const W = 600;
const H = 320;
const NODES = [
  { x: 80, y: 100 },
  { x: 160, y: 230 },
  { x: 250, y: 110 },
  { x: 330, y: 240 },
  { x: 365, y: 110 },
  { x: 480, y: 220 },
  { x: 535, y: 80 },
];
const BORDER_X = 420;
const MINISTRY_MS = 4000;
const CIRCLE_R = 90;
const SP_MS = 400;
const MESH: [number, number][] = [
  [0, 2], [0, 1], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [4, 6], [5, 6], [1, 2], [3, 4],
];
const ALL = NODES.map((_, i) => i);

interface Props {
  era: Era;
  onFire: (era: Era, extra?: string) => void;
  sharedEvent: string;
}

export function TrialCanvas({ era, onFire, sharedEvent }: Props) {
  const [aware, setAware] = useState<number[]>([]);
  const [tokens, setTokens] = useState(false);
  const [sent, setSent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [circle, setCircle] = useState({ x: 250, y: 160 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  const toLocal = (e: ReactPointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return circle;
    const r = svg.getBoundingClientRect();
    return {
      x: Math.min(W, Math.max(0, ((e.clientX - r.left) / r.width) * W)),
      y: Math.min(H, Math.max(0, ((e.clientY - r.top) / r.height) * H)),
    };
  };

  const fire = () => {
    setSent(true);
    if (era === "tribe") {
      setAware(
        ALL.filter((i) => Math.hypot(NODES[i].x - circle.x, NODES[i].y - circle.y) <= CIRCLE_R),
      );
      onFire(era);
    } else if (era === "nation") {
      if (timer.current !== null) window.clearInterval(timer.current);
      setAware(ALL.filter((i) => NODES[i].x < BORDER_X));
      setProgress(0);
      const start = performance.now();
      timer.current = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / MINISTRY_MS);
        setProgress(p);
        if (p >= 1) {
          if (timer.current !== null) window.clearInterval(timer.current);
          timer.current = null;
          setAware(ALL);
        }
      }, 60);
      onFire(era);
    } else if (era === "web3") {
      setTokens(true);
      onFire(era);
    } else {
      setAware(ALL);
      onFire(era, sharedEvent);
    }
  };

  const nudge = (dx: number, dy: number) =>
    setCircle((c) => ({
      x: Math.min(W, Math.max(0, c.x + dx)),
      y: Math.min(H, Math.max(0, c.y + dy)),
    }));

  const pending = era === "nation" && sent && progress < 1;
  let status = "";
  if (era === "tribe" && !sent) status = actIStrings.dragHint;
  else if (pending) status = actIStrings.ministryHint;
  else if (era === "web3" && sent) status = actIStrings.tokenHint;
  else if (era === "sp" && sent) status = "";
  else if (sent) status = actIStrings.resendHint;

  return (
    <div className="trial" aria-label={actIStrings.trialLabel}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="trial__svg"
        onPointerMove={(e) => {
          if (era === "tribe" && dragging.current) setCircle(toLocal(e));
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
      >
        {era === "sp" && (
          <g className={`trial__mesh ${aware.length ? "is-drawn" : ""}`}>
            {MESH.map(([a, b], i) => (
              <line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                pathLength={1}
                style={{ transitionDuration: `${SP_MS}ms` }}
              />
            ))}
          </g>
        )}

        {era === "web3" && tokens && (
          <g className="trial__chain">
            {NODES.slice(1).map((n, i) => (
              <line key={i} x1={NODES[i].x + 14} y1={NODES[i].y - 14} x2={n.x + 14} y2={n.y - 14} />
            ))}
          </g>
        )}

        {era === "nation" && (
          <g>
            <line x1={BORDER_X} y1={16} x2={BORDER_X} y2={H - 16} className="trial__border" />
            <text x={BORDER_X + 8} y={26} className="trial__tag">
              {actIStrings.border}
            </text>
          </g>
        )}

        {era === "tribe" && (
          <circle
            cx={circle.x}
            cy={circle.y}
            r={CIRCLE_R}
            className="trial__zone"
            tabIndex={0}
            role="slider"
            aria-label={actIStrings.dragHint}
            aria-valuetext={`${circle.x.toFixed(0)}, ${circle.y.toFixed(0)}`}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as Element).setPointerCapture?.(e.pointerId);
            }}
            onKeyDown={(e) => {
              const step = 14;
              if (e.key === "ArrowLeft") nudge(-step, 0);
              else if (e.key === "ArrowRight") nudge(step, 0);
              else if (e.key === "ArrowUp") nudge(0, -step);
              else if (e.key === "ArrowDown") nudge(0, step);
              else return;
              e.preventDefault();
            }}
          />
        )}

        {NODES.map((n, i) => {
          const lit = aware.includes(i);
          return (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={9}
              className={`trial__node ${lit ? "is-lit" : ""}`}
              style={era === "sp" ? { transitionDelay: `${i * 50}ms` } : undefined}
            />
          );
        })}

        {era === "web3" &&
          NODES.map((n, i) => (
            <rect
              key={i}
              x={n.x + 8}
              y={n.y - 20}
              width={12}
              height={12}
              className={`trial__token ${tokens ? "is-lit" : ""}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            />
          ))}
      </svg>

      <div className="trial__bar">
        <HairlineButton variant="gold" onClick={fire}>
          {actI.send[era]} {common.arrow}
        </HairlineButton>
        {era === "nation" && (
          <div className="ministry" aria-hidden={!sent}>
            <span className="label">{actIStrings.ministry}</span>
            <span className="ministry__track">
              <span className="ministry__fill" style={{ width: `${progress * 100}%` }} />
            </span>
          </div>
        )}
        <p className="trial__status" aria-live="polite">
          {status}
        </p>
        <p className="trial__count label">
          {actIStrings.aware(aware.length, NODES.length)}
        </p>
      </div>
    </div>
  );
}

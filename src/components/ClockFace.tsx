import { useEffect, useState } from "react";
import { shell } from "../copy/content";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ClockFace() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const hand = (deg: number, len: number, w: number) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return (
      <line
        x1="16"
        y1="16"
        x2={16 + Math.cos(r) * len}
        y2={16 + Math.sin(r) * len}
        strokeWidth={w}
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="clockface" role="timer" aria-label={shell.clockLabel}>
      <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" className="clockface__rim" />
        <g className="clockface__hands">
          {hand(h * 30, 7, 1.4)}
          {hand(m * 6, 10.5, 1.1)}
        </g>
        <g className="clockface__sec">{hand(s * 6, 12, 0.8)}</g>
      </svg>
      <span className="clockface__digits">
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(s)}
      </span>
    </div>
  );
}

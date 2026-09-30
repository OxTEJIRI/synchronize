import { useMemo } from "react";
import type { Era } from "../state/types";
import { flatDots, flatGrid } from "./worldMap";

const W = 600;
const H = 320;
const MAP_W = 600;

/** Deterministic scatter so the sky does not reshuffle on every render. */
function stars(n: number): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 12345.6789;
    return [(a - Math.floor(a)) * W, (b - Math.floor(b)) * (H - 70), 0.6 + ((i * 7) % 5) * 0.25] as [
      number,
      number,
      number,
    ];
  });
}

const SKY = stars(46);

/** Era-specific stage art behind the seven nodes. Gold hairlines only. */
export function TrialBackdrop({ era }: { era: Era }) {
  const dots = useMemo(() => flatDots(MAP_W, 4), []);
  const grid = useMemo(() => flatGrid(MAP_W), []);

  return (
    <g className={`backdrop backdrop--${era}`} aria-hidden="true">
      {era === "tribe" && (
        <>
          {[130, 210, 290].map((r) => (
            <circle key={r} cx={300} cy={262} r={r} className="bd__line" />
          ))}
          {SKY.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className="bd__star" />
          ))}
          <path d="M0 262H600" className="bd__line bd__line--strong" />
          {Array.from({ length: 41 }, (_, i) => (
            <path key={i} d={`M${i * 15} 262l-6 10`} className="bd__line" />
          ))}
        </>
      )}

      {era === "nation" && (
        <g transform={`translate(0 ${(H - MAP_W / 2) / 2})`}>
          <path d={grid} className="bd__line" />
          <path d={dots} className="bd__land" />
        </g>
      )}

      {era === "web3" && (
        <>
          <defs>
            <pattern id="bd-ledger" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect x="3" y="3" width="24" height="24" className="bd__cell" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#bd-ledger)" />
          <path d="M0 160H600M300 0V320" className="bd__line bd__line--strong" />
        </>
      )}

      {era === "sp" && (
        <>
          {[60, 110, 160, 210, 260].map((r) => (
            <circle key={r} cx={300} cy={160} r={r} className="bd__line" />
          ))}
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const len = i % 5 === 0 ? 12 : 5;
            return (
              <path
                key={i}
                d={`M${300 + Math.cos(a) * 260} ${160 + Math.sin(a) * 260}L${
                  300 + Math.cos(a) * (260 - len)
                } ${160 + Math.sin(a) * (260 - len)}`}
                className="bd__line"
              />
            );
          })}
          <path d="M40 160H560M300 20V300" className="bd__line" />
        </>
      )}
    </g>
  );
}

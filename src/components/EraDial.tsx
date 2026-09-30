import { actI, actIStrings } from "../copy/content";
import type { Era } from "../state/types";
import { ERAS } from "../state/types";

const SIZE = 320;
const C = SIZE / 2;
const R = 128;
const GAP = 7; // degrees between arcs

function arc(startDeg: number, endDeg: number): string {
  const p = (deg: number) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return `${C + R * Math.cos(r)} ${C + R * Math.sin(r)}`;
  };
  return `M ${p(startDeg)} A ${R} ${R} 0 0 1 ${p(endDeg)}`;
}

interface Props {
  era: Era;
  visited: Era[];
  onSelect: (era: Era) => void;
}

export function EraDial({ era, visited, onSelect }: Props) {
  const info = actI.eras[era];
  return (
    <div className="dial">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label={actIStrings.dialLabel}
        className="dial__svg"
      >
        <circle cx={C} cy={C} r={R - 18} className="dial__inner" />
        <circle cx={C} cy={C} r={R + 16} className="dial__outer" />
        {ERAS.map((e, i) => {
          const start = i * 90 + GAP / 2;
          const end = (i + 1) * 90 - GAP / 2;
          const d = arc(start, end);
          const selected = e === era;
          return (
            <g
              key={e}
              className={`dial__arc ${selected ? "is-selected" : ""} ${
                visited.includes(e) ? "is-visited" : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label={actI.eras[e].label}
              aria-pressed={selected}
              onClick={() => onSelect(e)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onSelect(e);
                }
              }}
            >
              <path d={d} className="dial__hit" />
              <path d={d} className="dial__stroke" />
            </g>
          );
        })}
      </svg>
      <div className="dial__center" aria-hidden="true">
        <span className="label">{info.dim}</span>
        <span className="dial__era">{info.label}</span>
      </div>
    </div>
  );
}

import { actI, actIStrings } from "../copy/content";
import type { Era } from "../state/types";
import { ERAS } from "../state/types";
import { worldMapPath } from "./worldMap";

const SIZE = 380;
const C = SIZE / 2;
const R = 124;
const GAP = 7; // degrees between arcs
const MAP_W = 232;
const MAP = worldMapPath(MAP_W);

const pt = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${C + r * Math.cos(a)} ${C + r * Math.sin(a)}`;
};

/** Clockwise arc from start to end degrees (0 = 12 o'clock). */
const arc = (r: number, start: number, end: number) => `M ${pt(r, start)} A ${r} ${r} 0 0 1 ${pt(r, end)}`;
/** The same span drawn counter-clockwise, so text on the lower half reads upright. */
const arcBack = (r: number, start: number, end: number) => `M ${pt(r, end)} A ${r} ${r} 0 0 0 ${pt(r, start)}`;

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
        <defs>
          <clipPath id="dial-clip">
            <circle cx={C} cy={C} r={R - 20} />
          </clipPath>
        </defs>

        <circle cx={C} cy={C} r={R - 18} className="dial__inner" />
        <circle cx={C} cy={C} r={R - 46} className="dial__inner dial__inner--faint" />
        <circle cx={C} cy={C} r={R + 14} className="dial__outer" />

        <g clipPath="url(#dial-clip)" className="dial__map" aria-hidden="true">
          <g transform={`translate(${C - MAP_W / 2} ${C - MAP_W / 4})`}>
            <path d={MAP} />
          </g>
          <path d={`M ${C - R} ${C} H ${C + R} M ${C} ${C - R} V ${C + R}`} className="dial__cross" />
        </g>

        {ERAS.map((e, i) => {
          const start = i * 90 + GAP / 2;
          const end = (i + 1) * 90 - GAP / 2;
          const lower = i === 1 || i === 2;
          const labelR = lower ? R + 30 : R + 22;
          const labelId = `dial-label-${e}`;
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
              <path d={arc(R, start, end)} className="dial__hit" />
              <path d={arc(R, start, end)} className="dial__halo" />
              <path d={arc(R, start, end)} className="dial__stroke" />
              <path
                id={labelId}
                d={lower ? arcBack(labelR, start, end) : arc(labelR, start, end)}
                className="dial__labelpath"
              />
              <text className="dial__label">
                <textPath href={`#${labelId}`} startOffset="50%" textAnchor="middle">
                  {actI.eras[e].label}
                </textPath>
              </text>
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

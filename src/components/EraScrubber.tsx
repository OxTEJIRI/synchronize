import { actI, actIStrings } from "../copy/content";
import type { Era } from "../state/types";
import { ERAS } from "../state/types";

interface Props {
  era: Era;
  visited: Era[];
  onSelect: (era: Era) => void;
}

export function EraScrubber({ era, visited, onSelect }: Props) {
  const idx = ERAS.indexOf(era);
  return (
    <div className="scrubber" role="group" aria-label={actIStrings.scrubberLabel}>
      <span
        className="scrubber__fill"
        style={{ width: `${(idx / (ERAS.length - 1)) * 100}%` }}
        aria-hidden="true"
      />
      {ERAS.map((e, i) => (
        <button
          key={e}
          type="button"
          className={`scrubber__stop ${e === era ? "is-current" : ""} ${
            visited.includes(e) ? "is-visited" : ""
          }`}
          aria-pressed={e === era}
          onClick={() => onSelect(e)}
        >
          <span className="scrubber__pip" aria-hidden="true" />
          <span className="scrubber__label">
            <span className="scrubber__n">{i + 1}</span>
            {actI.eras[e].label}
          </span>
        </button>
      ))}
    </div>
  );
}

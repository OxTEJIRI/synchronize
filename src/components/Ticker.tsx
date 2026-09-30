import { shell } from "../copy/content";
import type { TimelineEvent } from "../state/types";

const VISIBLE = 6;

export function Ticker({ events }: { events: TimelineEvent[] }) {
  const start = Math.max(0, events.length - VISIBLE);
  const shown = events.slice(start);
  return (
    <footer className="ticker" aria-label={shell.tickerLabel}>
      <span className="ticker__label">{shell.tickerLabel}</span>
      <ol className="ticker__list" aria-live="polite">
        {shown.length === 0 && <li className="ticker__item">{shell.tickerEmpty}</li>}
        {shown.map((e, i) => (
          <li key={start + i} className={`ticker__item ticker__item--${e.kind}`}>
            <span className="ticker__t">t+{e.t}</span>
            {e.text}
          </li>
        ))}
      </ol>
    </footer>
  );
}

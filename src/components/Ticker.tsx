import { shell, stressCopy } from "../copy/content";
import type { TimelineEvent } from "../state/types";

const VISIBLE = 6;

function Row({ events, track }: { events: TimelineEvent[]; track?: string }) {
  const start = Math.max(0, events.length - VISIBLE);
  // Newest first: the list is laid out right-to-left so the latest Event stays visible.
  const shown = events.slice(start).reverse();
  return (
    <div className="ticker__row">
      <span className="ticker__label">{track ?? shell.tickerLabel}</span>
      <ol className="ticker__list" aria-live={track === stressCopy.trackB ? "off" : "polite"}>
        {shown.length === 0 && <li className="ticker__item">{shell.tickerEmpty}</li>}
        {shown.map((e, i) => (
          <li
            key={`${track}-${events.length - 1 - i}`}
            className={`ticker__item ticker__item--${e.kind} ${e.track === "B" ? "is-b" : ""}`}
          >
            <span className="ticker__t">t+{e.t}</span>
            {e.text}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Under a fork the Timeline splits: track A misses the Events only track B recorded. */
export function Ticker({ events, fork }: { events: TimelineEvent[]; fork: boolean }) {
  return (
    <footer className={`ticker ${fork ? "ticker--fork" : ""}`} aria-label={shell.tickerLabel}>
      {fork ? (
        <>
          <Row events={events.filter((e) => e.track !== "B")} track={stressCopy.trackA} />
          <Row events={events} track={stressCopy.trackB} />
        </>
      ) : (
        <Row events={events} />
      )}
    </footer>
  );
}

import type { ReactNode } from "react";
import { brand, nav, shell } from "../copy/content";
import { go, ROUTE_HASH } from "../state/router";
import { canVisit } from "../state/store";
import type { Route, Session } from "../state/types";
import { ClockFace } from "./ClockFace";
import { RingBackdrop, TypeLockup } from "./primitives";
import { Ticker } from "./Ticker";

interface NavItem {
  key: keyof typeof nav;
  route: Route;
  matches: Route[];
}

const NAV_ITEMS: NavItem[] = [
  { key: "clock", route: "clock", matches: ["clock"] },
  { key: "society", route: "society", matches: ["society", "energy"] },
  { key: "break", route: "break", matches: ["break"] },
  { key: "lifeline", route: "lifeline", matches: ["lifeline"] },
];

interface Props {
  route: Route | "unknown";
  session: Session | null;
  children: ReactNode;
}

export function AppShell({ route, session, children }: Props) {
  const bare = route === "threshold";
  const showTicker = !bare && session !== null;

  return (
    <div className={`shell ${bare ? "shell--bare" : ""}`}>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {shell.skip}
      </a>
      <RingBackdrop />
      <header className="chrome">
        {bare ? (
          <span />
        ) : (
          <a
            className="chrome__mark"
            href={ROUTE_HASH.threshold}
            aria-label={brand.name}
          >
            <TypeLockup />
          </a>
        )}
        {!bare && (
          <nav className="chrome__nav" aria-label={shell.navLabel}>
            {NAV_ITEMS.map((item) => {
              const current = item.matches.includes(route as Route);
              const enabled = current || canVisit(item.route, session);
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`navlink ${current ? "is-current" : ""}`}
                  disabled={!enabled}
                  aria-current={current ? "page" : undefined}
                  onClick={() => go(item.route)}
                >
                  <span className="navlink__long">{nav[item.key]}</span>
                  <span className="navlink__short" aria-hidden="true">
                    {shell.navShort[item.key]}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
        <ClockFace />
      </header>
      <main
        id="main"
        className={`main ${route === "energy" ? "main--wide" : ""}`}
        tabIndex={-1}
        key={route}
      >
        {children}
      </main>
      {bare && <p className="footer-mark">{brand.footer}</p>}
      {showTicker && <Ticker events={session.events} />}
    </div>
  );
}

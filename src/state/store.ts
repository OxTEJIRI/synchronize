import { useSyncExternalStore } from "react";
import { events as ev } from "../copy/content";
import { loadSession, saveSession } from "./persist";
import type { Era, Route, Session, TimelineEvent } from "./types";
import { ERAS } from "./types";

const TICK_MS = 1800;
const MAX_EVENTS = 200;

let session: Session | null = loadSession();
const listeners = new Set<() => void>();

function commit(next: Session | null) {
  session = next;
  saveSession(next);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => session);
}

/** Timeslot index since birth; Act II's loop will own `tick` once it runs. */
function nowT(s: Session): number {
  const elapsed = Math.floor((Date.now() - new Date(s.bornAt).getTime()) / TICK_MS);
  return Math.max(s.tick, elapsed, 0);
}

function withEvent(s: Session, text: string, kind: TimelineEvent["kind"]): Session {
  const events = [...s.events, { t: nowT(s), text, kind }].slice(-MAX_EVENTS);
  return { ...s, events };
}

export function createSession(actorName: string): void {
  commit({
    actorName,
    bornAt: new Date().toISOString(),
    societyName: "",
    vfs: ["parenting", "hunting", "curation", "governance"],
    energyDecay: 0.35,
    huntPressure: 0.45,
    erasVisited: [],
    trialsFired: [],
    stresses: {
      capture: false,
      predation: false,
      sybil: false,
      flatten: false,
      fork: false,
      architects: false,
    },
    architectBias: 0,
    actors: [],
    reserve: 0,
    tick: 0,
    events: [{ t: 0, text: ev.entered(actorName), kind: "system" }],
    paused: false,
    note: "",
    visited: ["threshold", "clock"],
  });
}

export function markVisited(route: Route): void {
  if (!session || session.visited.includes(route)) return;
  commit({ ...session, visited: [...session.visited, route] });
}

export function visitEra(era: Era, label: string): void {
  if (!session || session.erasVisited.includes(era)) return;
  commit(
    withEvent(
      { ...session, erasVisited: [...session.erasVisited, era] },
      ev.studied(label),
      "system",
    ),
  );
}

export function fireTrial(era: Era, label: string, extra?: string): void {
  if (!session) return;
  const fired = session.trialsFired.includes(era)
    ? session.trialsFired
    : [...session.trialsFired, era];
  let next = withEvent({ ...session, trialsFired: fired }, ev.sentOrder(label), "user");
  if (extra) next = withEvent(next, extra, "world");
  commit(next);
}

export function isActIComplete(s: Session | null): boolean {
  if (!s) return false;
  return (
    ERAS.every((e) => s.erasVisited.includes(e)) &&
    s.trialsFired.includes("nation") &&
    s.trialsFired.includes("sp")
  );
}

export function canVisit(route: Route, s: Session | null): boolean {
  if (route === "threshold" || route === "about") return true;
  if (!s) return false;
  if (route === "clock") return true;
  if (s.visited.includes(route)) return true;
  if (route === "society") return isActIComplete(s);
  return false;
}

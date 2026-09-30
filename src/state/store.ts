import { useSyncExternalStore } from "react";
import { events as ev, simEvents } from "../copy/content";
import { vfs as vfCopy } from "../copy/content";
import { loadSession, saveSession } from "./persist";
import { applyAction, initActors, RESERVE_START, stepTick } from "./simulation";
import type { Era, Route, Session, TimelineEvent, Transfer, UserAction, VF } from "./types";
import { ERAS } from "./types";

const TICK_MS = 1800;
const MAX_EVENTS = 200;

let session: Session | null = loadSession();
const listeners = new Set<() => void>();

function commit(next: Session | null, persist = true) {
  session = next;
  if (persist) saveSession(next);
  listeners.forEach((l) => l());
}

const transferListeners = new Set<(t: Transfer[]) => void>();

export function onTransfers(fn: (t: Transfer[]) => void) {
  transferListeners.add(fn);
  return () => {
    transferListeners.delete(fn);
  };
}

function emit(t: Transfer[]) {
  if (t.length) transferListeners.forEach((l) => l(t));
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
  if (s.actors.length > 0) return s.tick;
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
    locks: [],
    pendingChildren: 0,
    userActions: 0,
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

export function isStressReady(s: Session | null): boolean {
  return !!s && s.actors.length > 0 && s.tick >= 3 && s.userActions >= 1;
}

export function canVisit(route: Route, s: Session | null): boolean {
  if (route === "threshold" || route === "about") return true;
  if (!s) return false;
  if (route === "clock") return true;
  if (route === "society") return isActIComplete(s) || s.visited.includes(route);
  if (route === "energy") return s.actors.length > 0;
  if (route === "break") return isStressReady(s) || s.visited.includes(route);
  return s.visited.includes(route);
}

/* ---------- Act II ---------- */

export interface Ssc {
  name: string;
  vfs: VF[];
  energyDecay: number;
  huntPressure: number;
}

export function mintSociety(ssc: Ssc): void {
  if (!session) return;
  const name = ssc.name.trim();
  const list = ssc.vfs.map((v) => vfCopy[v].label).join(" · ");
  const base: Session = {
    ...session,
    societyName: name,
    vfs: ssc.vfs,
    energyDecay: ssc.energyDecay,
    huntPressure: ssc.huntPressure,
    actors: initActors(session.actorName),
    reserve: RESERVE_START,
    tick: 0,
    locks: [],
    pendingChildren: 0,
    userActions: 0,
    paused: false,
    visited: session.visited.includes("energy") ? session.visited : [...session.visited, "energy"],
  };
  commit(withEvent(base, simEvents.minted(name, list), "system"));
}

export function tickSession(): void {
  if (!session || session.paused || session.actors.length === 0) return;
  const { session: next, transfers } = stepTick(session);
  commit(next, next.tick % 5 === 0);
  emit(transfers);
}

export function doAction(action: UserAction): void {
  if (!session || session.actors.length === 0) return;
  const { session: next, transfers } = applyAction(session, action);
  commit(next);
  emit(transfers);
}

export function setPaused(paused: boolean): void {
  if (!session) return;
  commit({ ...session, paused });
}


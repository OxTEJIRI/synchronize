import { energyCopy, simEvents as sim } from "../copy/content";
import type { Actor, Session, Transfer, TimelineEvent, UserAction, VF } from "./types";
import { RESERVE_ID, TOTAL_E } from "./types";

export type Rng = () => number;

export const MAX_ACTORS = 22;
export const YOU_START = 8;
export const RESERVE_START = 4;
export const CHILD_ENDOWMENT = 0.8;
const NPC_COUNT = 16;

export interface SimResult {
  session: Session;
  transfers: Transfer[];
}

/* ---------- setup ---------- */

export function initActors(actorName: string, rng: Rng = Math.random): Actor[] {
  const raw = energyCopy.npcNames
    .slice(0, NPC_COUNT)
    .map(() => 2 + rng() * 5);
  const rawSum = raw.reduce((a, b) => a + b, 0);
  // Conserve: YOU + NPCs + reserve = TOTAL_E.
  const npcTotal = TOTAL_E - YOU_START - RESERVE_START;
  const npcs: Actor[] = energyCopy.npcNames.slice(0, NPC_COUNT).map((name, i) => ({
    id: `npc-${i}`,
    name,
    energy: (raw[i] / rawSum) * npcTotal,
    activity: 0.4 + rng() * 0.6,
  }));
  return [{ id: "you", name: actorName, energy: YOU_START, activity: 1, isYou: true }, ...npcs];
}

export function totalEnergy(s: Pick<Session, "actors" | "reserve" | "locks">): number {
  return (
    s.actors.reduce((sum, a) => sum + a.energy, 0) +
    s.reserve +
    s.locks.reduce((sum, l) => sum + l.amount, 0)
  );
}

/* ---------- helpers ---------- */

interface Draft extends Session {
  _tr: Transfer[];
}

function draft(s: Session): Draft {
  return {
    ...s,
    actors: s.actors.map((a) => ({ ...a })),
    locks: s.locks.map((l) => ({ ...l })),
    events: [...s.events],
    _tr: [],
  };
}

function finish(d: Draft): SimResult {
  const { _tr, ...session } = d;
  return { session, transfers: _tr };
}

function say(d: Draft, text: string, kind: TimelineEvent["kind"]) {
  d.events.push({ t: d.tick, text, kind });
}

const you = (d: Draft) => d.actors.find((a) => a.isYou)!;

/** Move energy between an actor and the reserve (or two actors). Clamped to the source balance. */
function move(d: Draft, from: Actor | typeof RESERVE_ID, to: Actor | typeof RESERVE_ID, amount: number): number {
  const have = from === RESERVE_ID ? d.reserve : from.energy;
  const amt = Math.max(0, Math.min(amount, have));
  if (amt <= 0) return 0;
  if (from === RESERVE_ID) d.reserve -= amt;
  else from.energy -= amt;
  if (to === RESERVE_ID) d.reserve += amt;
  else to.energy += amt;
  d._tr.push({
    from: from === RESERVE_ID ? RESERVE_ID : from.id,
    to: to === RESERVE_ID ? RESERVE_ID : to.id,
    amount: amt,
  });
  return amt;
}

function pick<T>(items: T[], weight: (t: T) => number, rng: Rng): T | null {
  const ws = items.map((i) => Math.max(0, weight(i)));
  const total = ws.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function has(d: Draft, vf: VF) {
  return d.vfs.includes(vf);
}

function huntAmount(target: Actor) {
  return Math.min(target.energy * 0.08, 1.4);
}

function nextChildName(d: Draft): string {
  const used = new Set(d.actors.map((a) => a.name));
  return (
    energyCopy.childNames.find((n) => !used.has(n)) ?? `Actor-${d.actors.length + 1}`
  );
}

/** Coin flip on a governance risk, tilted against the player once capture is armed. */
function settleGovern(d: Draft, amount: number, rng: Rng) {
  const me = you(d);
  const winP = d.stresses.capture ? 0.25 : 0.5;
  if (rng() < winP) {
    // Locked stake returns, plus a payout from the reserve.
    me.energy += amount;
    const paid = move(d, RESERVE_ID, me, 1.6);
    say(d, `${sim.governWon(me.name)}  ${sim.delta(paid)}`, "user");
  } else {
    const slash = Math.min(0.4, amount);
    me.energy += amount - slash;
    d.reserve += slash;
    d._tr.push({ from: me.id, to: RESERVE_ID, amount: slash });
    say(d, `${sim.governLost(me.name)}  ${sim.delta(-slash)}`, "user");
  }
}

/* ---------- one Timeslot ---------- */

export function stepTick(s: Session, rng: Rng = Math.random): SimResult {
  const d = draft(s);
  d.tick += 1;
  const me = you(d);
  const candidates: string[] = [];

  // Locked governance stakes mature.
  d.locks = d.locks.filter((l) => {
    l.ttl -= 1;
    if (l.ttl > 0) return true;
    settleGovern(d, l.amount, rng);
    return false;
  });

  // A parented Actor arrives, endowed from the reserve.
  if (d.pendingChildren > 0) {
    for (let i = 0; i < d.pendingChildren; i++) {
      if (d.actors.length >= MAX_ACTORS) {
        move(d, RESERVE_ID, me, CHILD_ENDOWMENT); // cap reached: refund the parent
        continue;
      }
      const child: Actor = {
        id: `child-${d.tick}-${i}`,
        name: nextChildName(d),
        energy: 0,
        activity: 0.3,
      };
      d.actors.push(child);
      move(d, RESERVE_ID, child, CHILD_ENDOWMENT);
      say(d, sim.born(child.name), "world");
    }
    d.pendingChildren = 0;
  }

  // 1. NPC actions.
  for (const a of d.actors) {
    if (a.isYou) continue;
    const idleP = 0.15 + 0.5 * (1 - a.activity);
    if (rng() < idleP) {
      a.activity = Math.max(0, a.activity - 0.15);
      continue;
    }
    a.activity = Math.min(1, a.activity + 0.5);
    if (has(d, "curation") && rng() < 0.35) {
      move(d, a, RESERVE_ID, 0.2);
      if (rng() > 0.4) {
        const got = move(d, RESERVE_ID, a, 0.4);
        candidates.push(`${sim.curatedWell(a.name)}  ${sim.delta(got - 0.2)}`);
      } else {
        candidates.push(`${sim.curatedHollow(a.name)}  ${sim.delta(-0.2)}`);
      }
    } else if (has(d, "governance") && rng() < 0.15) {
      move(d, a, RESERVE_ID, 0.4);
      if (rng() < 0.5) move(d, RESERVE_ID, a, 0.8);
      candidates.push(sim.governed(a.name));
    }
  }

  // 2. Decay pools into the reserve.
  for (const a of d.actors) {
    const harder = a.isYou && a.activity === 0 ? 3 : 1;
    move(d, a, RESERVE_ID, a.energy * d.energyDecay * 0.02 * harder);
  }
  d._tr = d._tr.filter((t) => !(t.to === RESERVE_ID && t.amount < 0.15)); // keep particles legible

  // 3. The Hunt.
  if (has(d, "hunting") && rng() < Math.min(1, 0.4 + d.huntPressure)) {
    const hunter = pick(d.actors, (a) => a.activity + 0.05, rng);
    const hunted = pick(
      d.actors.filter((a) => a !== hunter),
      (a) => (1 - a.activity + 0.05) * d.huntPressure,
      rng,
    );
    if (hunter && hunted) {
      const got = move(d, hunted, hunter, huntAmount(hunted));
      if (got > 0) {
        const line = `${sim.hunted(hunter.name, hunted.name)}  ${sim.delta(got)}`;
        if (hunter.isYou || hunted.isYou) say(d, line, "world");
        else candidates.push(line);
      }
    }
  }

  // 4. Farming: active Actors draw a slow drip from the reserve.
  if (has(d, "farming")) {
    const farmers = d.actors.filter((a) => a.activity >= 0.5);
    const drip = Math.min(d.reserve * 0.05, 1.2);
    if (farmers.length && drip > 0) {
      const share = drip / farmers.length;
      for (const f of farmers) move(d, RESERVE_ID, f, share);
    }
  }

  // Your activity fades.
  me.activity = Math.max(0, me.activity - 0.15);

  // 5. Zero to two NPC Events reach the ticker.
  const r = rng();
  const n = Math.min(candidates.length, r < 0.25 ? 0 : r < 0.7 ? 1 : 2);
  for (let i = 0; i < n; i++) {
    const j = Math.floor(rng() * candidates.length);
    say(d, candidates.splice(j, 1)[0], "world");
  }

  return finish(d);
}

/* ---------- user actions ---------- */

export function applyAction(s: Session, action: UserAction, rng: Rng = Math.random): SimResult {
  const d = draft(s);
  const me = you(d);

  switch (action) {
    case "parent": {
      const paid = move(d, me, RESERVE_ID, CHILD_ENDOWMENT);
      if (paid > 0) d.pendingChildren += 1;
      say(d, sim.parented(me.name), "user");
      break;
    }
    case "hunt": {
      const target = pick(
        d.actors.filter((a) => !a.isYou),
        (a) => 1 - a.activity + 0.05,
        rng,
      );
      if (target) {
        const got = move(d, target, me, huntAmount(target));
        say(d, `${sim.hunted(me.name, target.name)}  ${sim.delta(got)}`, "user");
      }
      break;
    }
    case "curate": {
      const staked = move(d, me, RESERVE_ID, 0.3);
      if (rng() > 0.4) {
        const got = move(d, RESERVE_ID, me, 0.6);
        say(d, `${sim.curatedWell(me.name)}  ${sim.delta(got - staked)}`, "user");
      } else {
        const lost = move(d, me, RESERVE_ID, 0.1);
        say(d, `${sim.curatedHollow(me.name)}  ${sim.delta(-(staked + lost))}`, "user");
      }
      break;
    }
    case "govern": {
      const amount = Math.min(1.0, me.energy);
      me.energy -= amount;
      d.locks.push({ ttl: 3, amount });
      say(d, sim.governed(me.name), "user");
      break;
    }
    case "idle": {
      say(d, sim.idle(me.name), "user");
      break;
    }
  }

  me.activity = action === "idle" ? 0 : 1;
  d.userActions += 1;
  return finish(d);
}

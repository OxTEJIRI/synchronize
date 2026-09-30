import { energyCopy, simEvents as sim, stressEvents, actIII } from "../copy/content";
import type { Actor, Session, Stress, Transfer, TimelineEvent, UserAction, VF } from "./types";
import { RESERVE_ID, TOTAL_E } from "./types";

export type Rng = () => number;

export const MAX_ACTORS = 22;
export const YOU_START = 8;
export const RESERVE_START = 4;
export const CHILD_ENDOWMENT = 0.8;
export const GHOST_COUNT = 3;
export const FOUNDING_IDS = ["npc-0", "npc-1", "npc-2"];
const NPC_COUNT = 16;

export interface SimResult {
  session: Session;
  transfers: Transfer[];
}

/* ---------- setup ---------- */

export function initActors(actorName: string, rng: Rng = Math.random): Actor[] {
  const raw = energyCopy.npcNames.slice(0, NPC_COUNT).map(() => 2 + rng() * 5);
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

export const realActors = (actors: Actor[]) => actors.filter((a) => !a.isGhost);

/** The three richest real Actors: the "Core" that governor capture feeds. */
export function coreIds(actors: Actor[]): string[] {
  return [...realActors(actors)]
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 3)
    .map((a) => a.id);
}

/* ---------- helpers ---------- */

interface Draft extends Session {
  _tr: Transfer[];
  _rng: Rng;
}

function draft(s: Session, rng: Rng): Draft {
  return {
    ...s,
    actors: s.actors.map((a) => ({ ...a })),
    locks: s.locks.map((l) => ({ ...l })),
    events: [...s.events],
    stresses: { ...s.stresses },
    armedOrder: [...s.armedOrder],
    _tr: [],
    _rng: rng,
  };
}

function finish(d: Draft): SimResult {
  const { _tr, _rng, ...session } = d;
  void _rng;
  return { session, transfers: _tr };
}

/** Under a fork, 30% of ordinary Events reach only track B. */
function say(d: Draft, text: string, kind: TimelineEvent["kind"], forceB = false) {
  const ev: TimelineEvent = { t: d.tick, text, kind };
  if (d.stresses.fork && kind !== "stress" && kind !== "system" && (forceB || d._rng() < 0.3)) {
    ev.track = "B";
  }
  d.events.push(ev);
}

const you = (d: Draft) => d.actors.find((a) => a.isYou)!;
const reals = (d: Draft) => realActors(d.actors);

function move(
  d: Draft,
  from: Actor | typeof RESERVE_ID,
  to: Actor | typeof RESERVE_ID,
  amount: number,
  record = true,
): number {
  const have = from === RESERVE_ID ? d.reserve : from.energy;
  const amt = Math.max(0, Math.min(amount, have));
  if (amt <= 0) return 0;
  if (from === RESERVE_ID) d.reserve -= amt;
  else from.energy -= amt;
  if (to === RESERVE_ID) d.reserve += amt;
  else to.energy += amt;
  if (record) {
    d._tr.push({
      from: from === RESERVE_ID ? RESERVE_ID : from.id,
      to: to === RESERVE_ID ? RESERVE_ID : to.id,
      amount: amt,
    });
  }
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

const has = (d: Draft, vf: VF) => d.vfs.includes(vf);
const huntMult = (d: Draft) => (d.stresses.predation ? 2.2 : 1);
const huntLive = (d: Draft) => has(d, "hunting") || d.stresses.predation;

function huntAmount(d: Draft, target: Actor) {
  return Math.min(target.energy * 0.08, 1.4) * huntMult(d);
}

/** Fork: some transfers never bind. Returns true when this one is disputed. */
function disputed(d: Draft, ...who: Actor[]): boolean {
  if (!d.stresses.fork || d._rng() >= 0.3) return false;
  who.forEach((a) => (a.fork = true));
  return true;
}

function nextChildName(d: Draft): string {
  const used = new Set(d.actors.map((a) => a.name));
  return energyCopy.childNames.find((n) => !used.has(n)) ?? `Actor-${reals(d).length + 1}`;
}

/** Coin flip on a governance risk, tilted against the player once capture is armed. */
function settleGovern(d: Draft, amount: number) {
  const me = you(d);
  const winP = d.stresses.capture ? 0.25 : 0.5;
  if (d._rng() < winP) {
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

/* ---------- stress toggles ---------- */

export function applyStress(
  s: Session,
  id: Stress,
  on: boolean,
  rng: Rng = Math.random,
): SimResult {
  const d = draft(s, rng);
  if (d.stresses[id] === on) return finish(d);
  d.stresses[id] = on;
  const label = actIII.stresses[id].label;

  if (on) {
    d.armedOrder = [...d.armedOrder.filter((x) => x !== id), id];
    d.events.push({ t: d.tick, text: stressEvents.armed(label), kind: "stress" });
    if (id === "architects" && d.architectBias === 0) d.architectBias = 0.5;
    if (id === "sybil" && !d.actors.some((a) => a.isGhost)) {
      for (let i = 0; i < GHOST_COUNT; i++) {
        d.actors.push({ id: `ghost-${i}`, name: "", energy: 0, activity: 0, isGhost: true });
      }
    }
  } else {
    d.armedOrder = d.armedOrder.filter((x) => x !== id);
    d.events.push({ t: d.tick, text: stressEvents.disarmed(label), kind: "system" });
    if (id === "sybil") {
      // Ghost balances return to the reserve: Energy is never destroyed.
      for (const g of d.actors.filter((a) => a.isGhost)) move(d, g, RESERVE_ID, g.energy, false);
      d.actors = d.actors.filter((a) => !a.isGhost);
    }
    if (id === "fork") d.actors.forEach((a) => (a.fork = false));
  }
  return finish(d);
}

/* ---------- one Timeslot ---------- */

export function stepTick(s: Session, rng: Rng = Math.random): SimResult {
  const d = draft(s, rng);
  d.tick += 1;
  const me = you(d);
  const candidates: { text: string; b: boolean }[] = [];
  const flat = d.stresses.flatten;

  // Locked governance stakes mature.
  d.locks = d.locks.filter((l) => {
    l.ttl -= 1;
    if (l.ttl > 0) return true;
    settleGovern(d, l.amount);
    return false;
  });

  // A parented Actor arrives, endowed from the reserve.
  if (d.pendingChildren > 0) {
    for (let i = 0; i < d.pendingChildren; i++) {
      if (reals(d).length >= MAX_ACTORS) {
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

  // 1. NPC actions. Flatten collapses everyone toward one behaviour.
  for (const a of reals(d)) {
    if (a.isYou) continue;
    const idleP = flat ? 0.3 : 0.15 + 0.5 * (1 - a.activity);
    if (rng() < idleP) {
      a.activity = Math.max(0, a.activity - 0.15);
      continue;
    }
    a.activity = Math.min(1, a.activity + 0.5);
    if (has(d, "curation") && rng() < 0.35) {
      move(d, a, RESERVE_ID, 0.2);
      const hit = rng() > (flat ? 0.6 : 0.4);
      if (hit) {
        const b = disputed(d, a);
        const got = b ? 0 : move(d, RESERVE_ID, a, 0.4);
        candidates.push({
          text: `${sim.curatedWell(a.name)}  ${b ? stressEvents.unbound : sim.delta(got - 0.2)}`,
          b,
        });
      } else {
        candidates.push({ text: `${sim.curatedHollow(a.name)}  ${sim.delta(-0.2)}`, b: false });
      }
    } else if (has(d, "governance") && rng() < 0.15) {
      move(d, a, RESERVE_ID, 0.4);
      if (rng() < 0.5) move(d, RESERVE_ID, a, 0.8);
      candidates.push({ text: sim.governed(a.name), b: false });
    }
  }

  // 2. Decay pools into the reserve.
  for (const a of reals(d)) {
    const harder = a.isYou && a.activity === 0 ? 3 : 1;
    move(d, a, RESERVE_ID, a.energy * d.energyDecay * 0.02 * harder, false);
  }

  // 3. The Hunt. Predation makes it certain and heavier; flatten makes targets uniform.
  if (huntLive(d) && (d.stresses.predation || rng() < Math.min(1, 0.4 + d.huntPressure))) {
    const pool = reals(d);
    const hunter = pick(pool, (a) => (flat ? 1 : a.activity + 0.05), rng);
    const hunted = pick(
      pool.filter((a) => a !== hunter),
      (a) => (flat ? 1 : (1 - a.activity + 0.05) * d.huntPressure),
      rng,
    );
    if (hunter && hunted) {
      const b = disputed(d, hunter, hunted);
      const got = b ? 0 : move(d, hunted, hunter, huntAmount(d, hunted));
      const line = `${sim.hunted(hunter.name, hunted.name)}  ${b ? stressEvents.unbound : sim.delta(got)}`;
      if (b || got > 0) {
        if (hunter.isYou || hunted.isYou) say(d, line, "world", b);
        else candidates.push({ text: line, b });
      }
    }
  }

  // 3b. Predation also farms the quiet: a random NPC hunts every tick, whatever the Function says.
  if (d.stresses.predation) {
    const npcs = reals(d).filter((a) => !a.isYou);
    const farmer = npcs[Math.floor(rng() * npcs.length)];
    const victim = pick(
      reals(d).filter((a) => a !== farmer),
      (a) => 1 - a.activity + 0.05,
      rng,
    );
    if (farmer && victim) {
      const got = move(d, victim, farmer, huntAmount(d, victim));
      if (got > 0) {
        const line = `${stressEvents.farmed(farmer.name, victim.name)}  ${sim.delta(got)}`;
        if (victim.isYou) say(d, line, "world");
        else candidates.push({ text: line, b: false });
      }
    }
  }

  // 4. Farming: active Actors draw a slow drip from the reserve.
  if (has(d, "farming")) {
    const farmers = reals(d).filter((a) => a.activity >= 0.5);
    const drip = Math.min(d.reserve * 0.05, 1.2);
    if (farmers.length && drip > 0) {
      const share = drip / farmers.length;
      for (const f of farmers) move(d, RESERVE_ID, f, share, false);
    }
  }

  // Stress: governor capture. The Core absorbs 1.2% of everyone else's Energy.
  if (d.stresses.capture) {
    const ids = coreIds(d.actors);
    const core = ids.map((id) => d.actors.find((a) => a.id === id)!);
    let drawn = 0;
    reals(d)
      .filter((a) => !ids.includes(a.id))
      .forEach((v, k) => {
        drawn += move(d, v, core[k % core.length], v.energy * 0.012, k % 3 === 0);
      });
    if (d.tick % 3 === 0 && drawn > 0) {
      d.events.push({ t: d.tick, text: stressEvents.captureDraw(drawn), kind: "stress" });
    }
  }

  // Stress: architects. A share of 2% of everyone's Energy flows to the Founding set.
  if (d.stresses.architects && d.architectBias > 0) {
    const founders = FOUNDING_IDS.map((id) => d.actors.find((a) => a.id === id)).filter(
      (a): a is Actor => !!a,
    );
    let drawn = 0;
    if (founders.length) {
      reals(d)
        .filter((a) => !FOUNDING_IDS.includes(a.id))
        .forEach((v, k) => {
          drawn += move(d, v, founders[k % founders.length], v.energy * 0.02 * d.architectBias, k % 3 === 0);
        });
    }
    if (d.tick % 4 === 2 && drawn > 0) {
      d.events.push({ t: d.tick, text: stressEvents.foundingDraw(drawn), kind: "stress" });
    }
  }

  // Stress: sybil crack. Three ghosts glued to YOU siphon 0.1E each from neighbours.
  if (d.stresses.sybil) {
    const ghosts = d.actors.filter((a) => a.isGhost);
    const victims = reals(d).filter((a) => !a.isYou);
    ghosts.forEach((g) => {
      const v = victims[Math.floor(rng() * victims.length)];
      if (v) move(d, v, g, 0.1);
    });
  }

  // Your activity fades; flatten drags everyone else to one level.
  me.activity = Math.max(0, me.activity - 0.15);
  if (flat) for (const a of reals(d)) if (!a.isYou) a.activity += (0.5 - a.activity) * 0.5;
  if (d.stresses.fork) for (const a of d.actors) if (a.fork && rng() < 0.1) a.fork = false;

  // 5. Zero to two NPC Events reach the ticker.
  const r = rng();
  const n = Math.min(candidates.length, r < 0.25 ? 0 : r < 0.7 ? 1 : 2);
  for (let i = 0; i < n; i++) {
    const c = candidates.splice(Math.floor(rng() * candidates.length), 1)[0];
    say(d, c.text, "world", c.b);
  }

  return finish(d);
}

/* ---------- user actions ---------- */

export function applyAction(s: Session, action: UserAction, rng: Rng = Math.random): SimResult {
  const d = draft(s, rng);
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
        reals(d).filter((a) => !a.isYou),
        (a) => (d.stresses.flatten ? 1 : 1 - a.activity + 0.05),
        rng,
      );
      if (target) {
        const got = move(d, target, me, huntAmount(d, target));
        say(d, `${sim.hunted(me.name, target.name)}  ${sim.delta(got)}`, "user");
      }
      break;
    }
    case "curate": {
      const staked = move(d, me, RESERVE_ID, 0.3);
      if (rng() > (d.stresses.flatten ? 0.6 : 0.4)) {
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

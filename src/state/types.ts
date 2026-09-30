export type VF =
  | "parenting"
  | "hunting"
  | "property"
  | "curation"
  | "governance"
  | "organizations"
  | "communication"
  | "farming"
  | "portal";

export type Era = "tribe" | "nation" | "web3" | "sp";

export type Stress =
  | "capture"
  | "predation"
  | "sybil"
  | "flatten"
  | "fork"
  | "architects";

export type Route =
  | "threshold"
  | "clock"
  | "society"
  | "energy"
  | "break"
  | "lifeline"
  | "about";

export interface TimelineEvent {
  t: number;
  text: string;
  kind: "user" | "world" | "stress" | "system";
  track?: "A" | "B";
}

export interface Actor {
  id: string;
  name: string;
  energy: number;
  activity: number;
  isYou?: boolean;
  isGhost?: boolean;
}

export interface Session {
  actorName: string;
  bornAt: string;
  societyName: string;
  vfs: VF[];
  energyDecay: number;
  huntPressure: number;
  erasVisited: Era[];
  trialsFired: Era[];
  stresses: Record<Stress, boolean>;
  architectBias: number;
  actors: Actor[];
  reserve: number;
  tick: number;
  events: TimelineEvent[];
  paused: boolean;
  note: string;
  visited: Route[];
  locks: { ttl: number; amount: number }[];
  pendingChildren: number;
  userActions: number;
}

export const ERAS: Era[] = ["tribe", "nation", "web3", "sp"];

export const TOTAL_E = 100;
export const RESERVE_ID = "reserve";

export type UserAction = "parent" | "hunt" | "curate" | "govern" | "idle";

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

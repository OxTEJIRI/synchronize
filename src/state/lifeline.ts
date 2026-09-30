import { actIII, lifeline, vfs as vfCopy } from "../copy/content";
import type { Session } from "./types";

export interface LifelineData {
  name: string;
  society: string;
  birth: string;
  functions: string;
  stresses: string;
  note: string;
}

export function lifelineData(s: Session): LifelineData {
  const born = new Date(s.bornAt);
  const birth = Number.isNaN(born.getTime())
    ? s.bornAt
    : born.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZoneName: "short",
      });
  return {
    name: s.actorName,
    society: s.societyName || "—",
    birth,
    functions: s.vfs.map((v) => vfCopy[v].label).join(" · ") || "—",
    stresses: s.armedOrder.length
      ? s.armedOrder.map((id) => actIII.stresses[id].label).join(" · ")
      : lifeline.none,
    note: s.note.trim() || lifeline.defaultNote,
  };
}

/** Six plain lines, suitable for a chat message. */
export function summaryText(d: LifelineData): string {
  const f = lifeline.fields;
  return [
    lifeline.summaryHeader(d.name),
    `${f.instance}: ${d.society}`,
    `${f.birth}: ${d.birth}`,
    `${f.functions}: ${d.functions}`,
    `${f.stress}: ${d.stresses}`,
    `${f.note}: ${d.note}`,
  ].join("\n");
}

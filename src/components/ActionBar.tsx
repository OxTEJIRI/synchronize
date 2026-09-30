import { actII, energyCopy } from "../copy/content";
import { MAX_ACTORS } from "../state/simulation";
import { doAction } from "../state/store";
import type { Session, UserAction, VF } from "../state/types";

const ACTIONS: { action: UserAction; vf: VF; copy: keyof typeof actII.actions }[] = [
  { action: "parent", vf: "parenting", copy: "parenting" },
  { action: "hunt", vf: "hunting", copy: "hunting" },
  { action: "curate", vf: "curation", copy: "curation" },
  { action: "govern", vf: "governance", copy: "governance" },
];

export function ActionBar({ session }: { session: Session }) {
  const you = session.actors.find((a) => a.isYou);
  const disabled = (a: UserAction) => {
    if (!you) return true;
    if (a === "parent") return session.actors.length + session.pendingChildren >= MAX_ACTORS || you.energy < 0.8;
    if (a === "govern") return session.locks.length > 0 || you.energy < 1;
    return false;
  };
  const shown = ACTIONS.filter((x) => session.vfs.includes(x.vf));

  return (
    <div className="actions" role="group" aria-label={energyCopy.actionsLabel}>
      {shown.map((x) => (
        <button
          key={x.action}
          type="button"
          className="action"
          disabled={disabled(x.action)}
          onClick={() => doAction(x.action)}
        >
          <span className="action__label">{actII.actions[x.copy].label}</span>
          <span className="action__hint">{actII.actions[x.copy].hint}</span>
        </button>
      ))}
      <button type="button" className="action action--idle" onClick={() => doAction("idle")}>
        <span className="action__label">{actII.actions.idle.label}</span>
        <span className="action__hint">{actII.actions.idle.hint}</span>
      </button>
    </div>
  );
}

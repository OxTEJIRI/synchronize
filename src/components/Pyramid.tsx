import { energyCopy } from "../copy/content";
import type { Session } from "../state/types";

export function Pyramid({ session }: { session: Session }) {
  const sorted = [...session.actors].sort((a, b) => b.energy - a.energy);
  const n = sorted.length;
  const size = Math.ceil(n / 5);
  const tiers = energyCopy.tiers
    .map((label, i) => {
      const members = sorted.slice(i * size, (i + 1) * size);
      return {
        label,
        members,
        sum: members.reduce((s, a) => s + a.energy, 0),
        hasYou: members.some((a) => a.isYou),
      };
    })
    .filter((t) => t.members.length > 0);
  const maxSum = Math.max(...tiers.map((t) => t.sum), 0.01);
  const me = sorted.find((a) => a.isYou);
  const rank = me ? sorted.indexOf(me) + 1 : n;
  const locked = session.locks.reduce((s, l) => s + l.amount, 0);
  const total = sorted.reduce((s, a) => s + a.energy, 0) + session.reserve + locked;

  return (
    <div className="pyramid">
      <span className="label">{energyCopy.pyramidLabel}</span>
      <ol className="pyramid__tiers">
        {tiers.map((t) => (
          <li key={t.label} className={`tier ${t.hasYou ? "has-you" : ""}`}>
            <span className="tier__bar" style={{ width: `${Math.max(14, (t.sum / maxSum) * 100)}%` }}>
              <span className="tier__sum">{t.sum.toFixed(1)}E</span>
            </span>
            <span className="tier__label">
              {t.label} · {t.members.length}
            </span>
          </li>
        ))}
      </ol>
      <p className="pyramid__you">{energyCopy.youLine(me?.energy ?? 0, rank, n)}</p>
      <p className="pyramid__meta">
        {energyCopy.reserveShort(session.reserve)}
        {locked > 0 && <> · {energyCopy.locked(locked)}</>}
      </p>
      <p className="pyramid__meta">{energyCopy.total(total)}</p>
    </div>
  );
}

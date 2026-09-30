import { actIII, stressCopy, vfs as vfCopy } from "../copy/content";
import { setArchitectBias, setStress } from "../state/store";
import type { Session, Stress } from "../state/types";
import { STRESSES } from "../state/types";
import { Icon } from "./Icons";
import { Knob } from "./primitives";

export function StressToggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`toggle ${on ? "is-on" : ""}`}
      onClick={onToggle}
    >
      <span className="toggle__switch" aria-hidden="true" />
      <span className="toggle__label">{label}</span>
    </button>
  );
}

export function StressList({ session }: { session: Session }) {
  return (
    <div className="stresslist">
      <span className="label">{stressCopy.togglesLabel}</span>
      <div className="stresslist__items">
        {STRESSES.map((id: Stress) => (
          <StressToggle
            key={id}
            label={actIII.stresses[id].label}
            on={session.stresses[id]}
            onToggle={() => setStress(id, !session.stresses[id])}
          />
        ))}
      </div>
      {session.stresses.architects && (
        <Knob
          label={stressCopy.architectBias}
          help={stressCopy.architectHelp}
          value={session.architectBias}
          onChange={setArchitectBias}
        />
      )}
      <div className={`sscchips ${session.stresses.flatten ? "is-locked" : ""}`}>
        <span className="label">{stressCopy.sscLabel}</span>
        <div className="sscchips__row">
          {session.vfs.map((v) => (
            <span key={v} className="sscchip">
              <Icon id={v} size={16} />
              {vfCopy[v].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CritiqueCard({ session }: { session: Session }) {
  const last = session.armedOrder[session.armedOrder.length - 1];
  return (
    <aside className="critique" aria-live="polite">
      {last ? (
        <>
          <p className="critique__copy">{actIII.stresses[last].card}</p>
          <ul className="critique__active">
            {[...session.armedOrder].reverse().map((id) => (
              <li key={id} className="label">
                {actIII.stresses[id].label}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="critique__copy critique__copy--idle">{stressCopy.idle}</p>
      )}
    </aside>
  );
}

import { useEffect, useRef, useState } from "react";
import { actII, common, societyCopy, vfs as vfCopy } from "../copy/content";
import { HairlineButton, Knob, TextField, VFChip } from "../components/primitives";
import { go } from "../state/router";
import { mintSociety } from "../state/store";
import type { Session, VF } from "../state/types";

const VF_IDS = Object.keys(vfCopy) as VF[];
const MIN_VF = 3;
const MAX_VF = 6;
const MAX_NAME = 20;

function randomName() {
  const list = societyCopy.namePrefixes;
  return `${list[Math.floor(Math.random() * list.length)]}-${1 + Math.floor(Math.random() * 12)}`;
}

export function ActSociety({ session }: { session: Session }) {
  const [name, setName] = useState(() => session.societyName || randomName());
  const [vfs, setVfs] = useState<VF[]>(session.vfs);
  const [decay, setDecay] = useState(session.energyDecay);
  const [hunt, setHunt] = useState(session.huntPressure);
  const [shaking, setShaking] = useState<VF | null>(null);
  const [warn, setWarn] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const toggle = (id: VF) => {
    if (vfs.includes(id)) {
      setVfs(vfs.filter((v) => v !== id));
      return;
    }
    if (vfs.length >= MAX_VF) {
      setShaking(id);
      setWarn(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setShaking(null);
        setWarn(false);
      }, 2400);
      return;
    }
    setVfs([...vfs, id]);
  };

  const valid = vfs.length >= MIN_VF && vfs.length <= MAX_VF && name.trim().length > 0;

  const mint = () => {
    if (!valid) return;
    // Keep the grid's canonical order in the SSC.
    mintSociety({
      name,
      vfs: VF_IDS.filter((v) => vfs.includes(v)),
      energyDecay: decay,
      huntPressure: hunt,
    });
    go("energy");
  };

  return (
    <section className="screen society">
      <header className="screen__head screen__head--left">
        <p className="label label--gold">{actII.kicker}</p>
        <h1 className="screen__title">{actII.title}</h1>
      </header>

      <div className="society__name">
        <span className="label">{actII.nameLabel}</span>
        <div className="society__namerow">
          <TextField
            label={actII.nameLabel}
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value.toUpperCase())}
          />
          <HairlineButton onClick={() => setName(randomName())}>{societyCopy.reroll}</HairlineButton>
        </div>
      </div>

      <div className="society__grid">
        <div>
          <div className="society__sectionhead">
            <span className="label">{actII.vfLabel}</span>
            <span className="label" aria-live="polite">
              {societyCopy.selected(vfs.length)}
            </span>
          </div>
          <div className="chips">
            {VF_IDS.map((id) => (
              <VFChip
                key={id}
                id={id}
                label={vfCopy[id].label}
                help={vfCopy[id].help}
                selected={vfs.includes(id)}
                shaking={shaking === id}
                onToggle={() => toggle(id)}
              />
            ))}
          </div>
          <p className={`society__warn ${warn ? "is-on" : ""}`} role="status">
            {warn ? actII.tooMany : vfs.length < MIN_VF ? societyCopy.chooseRange : ""}
          </p>
        </div>

        <div className="society__params">
          <span className="label">{actII.paramsLabel}</span>
          <Knob label={actII.decayLabel} help={actII.decayHelp} value={decay} onChange={setDecay} />
          <Knob label={actII.huntLabel} help={actII.huntHelp} value={hunt} onChange={setHunt} />
        </div>
      </div>

      <div className="society__mint">
        <HairlineButton variant="gold" disabled={!valid} onClick={mint}>
          {actII.mint} {common.arrow}
        </HairlineButton>
        <p className="society__ssc">{actII.ssc}</p>
      </div>
    </section>
  );
}

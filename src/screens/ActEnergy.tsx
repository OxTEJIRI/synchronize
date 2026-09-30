import { useEffect, useState } from "react";
import { actII, common, energyCopy } from "../copy/content";
import { ActionBar } from "../components/ActionBar";
import { NodeField } from "../components/NodeField";
import { HairlineButton } from "../components/primitives";
import { Pyramid } from "../components/Pyramid";
import { go } from "../state/router";
import { isStressReady, setPaused, tickSession } from "../state/store";
import type { Session } from "../state/types";

const TICK_MS = 1800;

export function ActEnergy({ session }: { session: Session }) {
  const [help, setHelp] = useState(false);
  const paused = session.paused;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(tickSession, TICK_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const ready = isStressReady(session);

  return (
    <section className="screen energy">
      <header className="energy__head">
        <div>
          <p className="label label--gold">{session.societyName}</p>
          <h1 className="screen__title">{actII.energyTitle}</h1>
        </div>
        <div className="energy__tools">
          <HairlineButton onClick={() => setPaused(!paused)}>
            {paused ? energyCopy.resume : energyCopy.pause}
          </HairlineButton>
          <HairlineButton aria-label={energyCopy.help} onClick={() => setHelp(true)}>
            ?
          </HairlineButton>
        </div>
      </header>

      <div className="energy__grid">
        <NodeField actors={session.actors} reserve={session.reserve} />
        <Pyramid session={session} />
      </div>

      <ActionBar session={session} />

      <div className="energy__continue">
        {!ready && <p className="clock__gate">{energyCopy.gate}</p>}
        <HairlineButton variant="gold" disabled={!ready} onClick={() => go("break")}>
          {actII.stressCta} {common.arrow}
        </HairlineButton>
      </div>

      {help && (
        <>
          <div className="scrim" onClick={() => setHelp(false)} />
          <aside className="slideover" role="dialog" aria-label={energyCopy.help}>
            <span className="label label--gold">{energyCopy.help}</span>
            <p>{actII.energyHelp}</p>
            <HairlineButton onClick={() => setHelp(false)}>{energyCopy.close}</HairlineButton>
          </aside>
        </>
      )}
    </section>
  );
}

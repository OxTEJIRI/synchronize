import { useEffect, useState } from "react";
import { actII, actIII, common, energyCopy } from "../copy/content";
import { ActionBar } from "../components/ActionBar";
import { NodeField } from "../components/NodeField";
import { HairlineButton } from "../components/primitives";
import { Pyramid } from "../components/Pyramid";
import { CritiqueCard, StressList } from "../components/StressPanels";
import { go } from "../state/router";
import { isStressReady, sealLifeline, setPaused, tickSession } from "../state/store";
import type { Session } from "../state/types";

const TICK_MS = 1800;

/**
 * Act II-B and Act III share one screen so the Energy canvas and the Timeslot
 * loop stay mounted when the visitor moves from Energy to Break.
 */
export function ActSim({ session, mode }: { session: Session; mode: "energy" | "break" }) {
  const [help, setHelp] = useState(false);
  const paused = session.paused;
  const breaking = mode === "break";

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
          <p className="label label--gold">
            {breaking ? actIII.kicker : session.societyName}
          </p>
          <h1 className="screen__title">{breaking ? actIII.title : actII.energyTitle}</h1>
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

      <div className={`energy__grid ${breaking ? "energy__grid--break" : ""}`}>
        {breaking && <StressList key="toggles" session={session} />}
        <NodeField
          key="field"
          actors={session.actors}
          reserve={session.reserve}
          stresses={session.stresses}
        />
        <div key="side" className="energy__side">
          <Pyramid session={session} />
          {breaking && <CritiqueCard session={session} />}
        </div>
      </div>

      <ActionBar session={session} />

      <div className="energy__continue">
        {breaking ? (
          <HairlineButton
            variant="gold"
            onClick={() => {
              sealLifeline();
              go("lifeline");
            }}
          >
            {actIII.seal} {common.arrow}
          </HairlineButton>
        ) : (
          <>
            {!ready && <p className="clock__gate">{energyCopy.gate}</p>}
            <HairlineButton variant="gold" disabled={!ready} onClick={() => go("break")}>
              {actII.stressCta} {common.arrow}
            </HairlineButton>
          </>
        )}
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

import { useEffect, useState } from "react";
import { actI, actIStrings, common, events } from "../copy/content";
import { EraDial } from "../components/EraDial";
import { EraScrubber } from "../components/EraScrubber";
import { HairlineButton } from "../components/primitives";
import { TrialCanvas } from "../components/TrialCanvas";
import { go } from "../state/router";
import { fireTrial, isActIComplete, visitEra } from "../state/store";
import type { Era, Session } from "../state/types";
import { ERAS } from "../state/types";

export function ActClock({ session }: { session: Session }) {
  const [era, setEra] = useState<Era>("tribe");
  const info = actI.eras[era];
  const done = isActIComplete(session);
  const idx = ERAS.indexOf(era);
  const prev = idx > 0 ? ERAS[idx - 1] : null;
  const next = idx < ERAS.length - 1 ? ERAS[idx + 1] : null;

  useEffect(() => {
    visitEra(era, actI.eras[era].label);
  }, [era]);

  return (
    <section className="screen clock">
      <header className="screen__head">
        <p className="label label--gold">{actI.kicker}</p>
        <h1 className="screen__title">{actIStrings.title}</h1>
      </header>

      <EraDial era={era} visited={session.erasVisited} onSelect={setEra} />

      <div className="eratabs" role="tablist" aria-label={actIStrings.dialLabel}>
        {ERAS.map((e) => (
          <button
            key={e}
            type="button"
            role="tab"
            aria-selected={e === era}
            className={`eratab ${e === era ? "is-current" : ""}`}
            onClick={() => setEra(e)}
          >
            {actI.eras[e].label}
          </button>
        ))}
      </div>

      <div className="clock__stage">
        <TrialCanvas
          key={era}
          era={era}
          sharedEvent={events.sharedEvent}
          onComplete={next ? () => setEra(next) : undefined}
          onFire={(e, extra) => fireTrial(e, actI.eras[e].label, extra)}
        />
        <aside className="caption">
          <span className="tag">{info.dim}</span>
          <h2 className="caption__title">{info.label}</h2>
          <p className="caption__what">{info.what}</p>
          <p className="caption__failure">{info.failure}</p>
        </aside>
      </div>

      <EraScrubber era={era} visited={session.erasVisited} onSelect={setEra} />

      <div className="eranav">
        <HairlineButton disabled={!prev} onClick={() => prev && setEra(prev)}>
          {common.arrowBack} {actIStrings.back}
        </HairlineButton>
        <HairlineButton disabled={!next} onClick={() => next && setEra(next)}>
          {actIStrings.next} {common.arrow}
        </HairlineButton>
      </div>

      <div className="clock__continue">
        <p className="clock__gate">{done ? actIStrings.gateDone : actIStrings.gate}</p>
        <HairlineButton variant="gold" disabled={!done} onClick={() => go("society")}>
          {actI.continue} {common.arrow}
        </HairlineButton>
      </div>
    </section>
  );
}

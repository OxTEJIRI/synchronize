import { useState } from "react";
import type { FormEvent } from "react";
import { common, lifeline } from "../copy/content";
import { HairlineButton, TextField } from "../components/primitives";
import { go } from "../state/router";
import { lifelineData, summaryText } from "../state/lifeline";
import { pngFilename, renderLifelinePng } from "../state/lifelineImage";
import { beginAnother, setNote, writeLastEvent } from "../state/store";
import type { Session } from "../state/types";

function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => legacyCopy(text),
    );
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

export function Lifeline({ session }: { session: Session }) {
  const data = lifelineData(session);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [writing, setWriting] = useState(false);
  const [line, setLine] = useState("");
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    const blob = await renderLifelinePng(data);
    setBusy(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pngFilename(data.name);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    const ok = await copyText(summaryText(data));
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied("idle"), 2000);
  };

  const submitLine = (e: FormEvent) => {
    e.preventDefault();
    writeLastEvent(line);
    setLine("");
    setWriting(false);
  };

  const again = () => {
    beginAnother();
    go("threshold");
  };

  const rows: [string, string][] = [
    [lifeline.fields.instance, data.society],
    [lifeline.fields.birth, data.birth],
    [lifeline.fields.functions, data.functions],
    [lifeline.fields.stress, data.stresses],
  ];

  return (
    <section className="screen lifeline">
      <article className="plaque">
        <p className="label label--gold">{lifeline.kicker}</p>
        <h1 className="plaque__name">{data.name}</h1>
        <dl className="plaque__rows">
          {rows.map(([k, v]) => (
            <div key={k} className="plaque__row">
              <dt className="label label--gold">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="plaque__row">
            <dt className="label label--gold">{lifeline.fields.note}</dt>
            <dd>
              <input
                className="plaque__note"
                aria-label={lifeline.noteLabel}
                value={session.note === "" ? lifeline.defaultNote : session.note}
                maxLength={120}
                onChange={(e) => setNote(e.target.value)}
              />
            </dd>
          </div>
        </dl>
      </article>

      <div className="lifeline__actions">
        <HairlineButton variant="gold" onClick={download} disabled={busy}>
          {lifeline.download}
        </HairlineButton>
        <HairlineButton onClick={copy}>
          {copied === "ok" ? lifeline.copied : copied === "fail" ? lifeline.copyFailed : lifeline.copy}
        </HairlineButton>
        <HairlineButton onClick={() => setWriting((w) => !w)} aria-expanded={writing}>
          {lifeline.lastEvent}
        </HairlineButton>
        <HairlineButton onClick={again}>{lifeline.again}</HairlineButton>
      </div>

      {writing && (
        <form className="lifeline__event" onSubmit={submitLine}>
          <TextField
            label={lifeline.lastEvent}
            value={line}
            maxLength={100}
            autoFocus
            placeholder={lifeline.eventPlaceholder}
            onChange={(e) => setLine(e.target.value)}
          />
          <HairlineButton type="submit" disabled={!line.trim()}>
            {lifeline.eventSubmit}
          </HairlineButton>
        </form>
      )}

      <a className="ghostlink" href="#/about">
        {lifeline.about} {common.arrow}
      </a>
    </section>
  );
}

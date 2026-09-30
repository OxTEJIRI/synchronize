import { useState } from "react";
import type { FormEvent } from "react";
import { brand, common, resume, threshold } from "../copy/content";
import { HairlineButton, TextField, TypeLockup } from "../components/primitives";
import { go } from "../state/router";
import { createSession } from "../state/store";
import type { Session } from "../state/types";

const MAX_NAME = 24;

function sanitize(v: string) {
  return v.replace(/[^\p{L}\p{N}\- ]/gu, "").slice(0, MAX_NAME);
}

export function Threshold({ session }: { session: Session | null }) {
  const [name, setName] = useState("");

  const enter = (raw: string) => {
    const clean = raw.trim();
    createSession(clean || threshold.defaultName);
    go("clock");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    enter(name);
  };

  return (
    <section className="screen threshold">
      <p className="label label--gold">{brand.eyebrow}</p>
      <h1 className="threshold__title">
        <TypeLockup size="hero" />
      </h1>
      <form className="threshold__form" onSubmit={submit}>
        <TextField
          label={threshold.nameLabel}
          value={name}
          maxLength={MAX_NAME}
          placeholder={threshold.placeholder}
          autoComplete="off"
          autoFocus
          onChange={(e) => setName(sanitize(e.target.value))}
        />
        <HairlineButton type="submit" variant="gold">
          {threshold.enter} {common.arrow}
        </HairlineButton>
      </form>
      <button type="button" className="ghostlink" onClick={() => enter("")}>
        {threshold.anonymous}
      </button>
      {session && (
        <button type="button" className="ghostlink" onClick={() => go("clock")}>
          {resume.as(session.actorName)}
        </button>
      )}
    </section>
  );
}

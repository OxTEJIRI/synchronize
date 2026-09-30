import { breakStub, notFound } from "../copy/content";
import { HairlineButton } from "../components/primitives";
import { go } from "../state/router";

export function BreakStub() {
  return (
    <section className="screen stub">
      <p className="label label--gold">{breakStub.kicker}</p>
      <h1 className="screen__title">{breakStub.title}</h1>
      <p className="stub__body">{breakStub.body}</p>
      <HairlineButton onClick={() => go("energy")}>{breakStub.back}</HairlineButton>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="screen stub">
      <h1 className="screen__title">{notFound.title}</h1>
      <HairlineButton onClick={() => go("threshold")}>{notFound.back}</HairlineButton>
    </section>
  );
}

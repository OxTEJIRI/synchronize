import { notFound, societyStub } from "../copy/content";
import { HairlineButton } from "../components/primitives";
import { go } from "../state/router";

export function SocietyStub() {
  return (
    <section className="screen stub">
      <p className="label label--gold">{societyStub.kicker}</p>
      <h1 className="screen__title">{societyStub.title}</h1>
      <p className="stub__body">{societyStub.body}</p>
      <HairlineButton onClick={() => go("clock")}>{societyStub.back}</HairlineButton>
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

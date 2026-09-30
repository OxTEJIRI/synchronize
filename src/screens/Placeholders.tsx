import { notFound } from "../copy/content";
import { HairlineButton } from "../components/primitives";
import { go } from "../state/router";

export function NotFound() {
  return (
    <section className="screen stub">
      <h1 className="screen__title">{notFound.title}</h1>
      <HairlineButton onClick={() => go("threshold")}>{notFound.back}</HairlineButton>
    </section>
  );
}

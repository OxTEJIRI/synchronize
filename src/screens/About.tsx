import { about } from "../copy/content";

const LINK_KEYS = ["home", "whitepaper", "glossary", "repo"] as const;

export function About() {
  return (
    <section className="screen about">
      <header className="screen__head screen__head--left">
        <h1 className="screen__title">{about.title}</h1>
      </header>

      <div className="about__block">
        <h2 className="about__h">{about.whatTitle}</h2>
        <p>{about.what}</p>
      </div>

      <div className="about__block">
        <h2 className="about__h">{about.tracksTitle}</h2>
        <dl className="about__list">
          {about.tracks.map((t) => (
            <div key={t.act}>
              <dt className="label label--gold">{t.act}</dt>
              <dd>{t.track}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="about__block">
        <h2 className="about__h">{about.termsTitle}</h2>
        <dl className="about__list">
          {about.terms.map((t) => (
            <div key={t.term}>
              <dt className="label label--gold">{t.term}</dt>
              <dd>{t.def}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="about__block">
        <h2 className="about__h">{about.linksTitle}</h2>
        <ul className="about__links">
          {LINK_KEYS.map((k) => (
            <li key={k}>
              <a href={about.links[k]} target="_blank" rel="noreferrer">
                {about.linkLabels[k]}
              </a>
            </li>
          ))}
        </ul>
        <p className="about__note">{about.simplification}</p>
        <p className="about__note">{about.unofficial}</p>
      </div>
    </section>
  );
}

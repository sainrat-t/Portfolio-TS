import { CONTACT, EXPERIENCES, LAB, PROJECTS } from '../data/content';
import { EGGS } from '../data/eggs';

/**
 * Rend un fragment de texte en y découpant l'éventuel déclencheur d'un easter
 * egg. Rien ne le distingue du reste de la phrase : ni style, ni curseur. Si le
 * libellé n'apparaît plus dans le texte, la phrase s'affiche telle quelle.
 */
function TextWithEgg({ text, onEgg }: { text: string; onEgg?: (id: string) => void }) {
  const egg = onEgg ? EGGS.find((e) => e.textTrigger && text.includes(e.textTrigger)) : undefined;
  if (!egg?.textTrigger) return <>{text}</>;
  const at = text.indexOf(egg.textTrigger);
  return (
    <>
      {text.slice(0, at)}
      <span onClick={() => onEgg?.(egg.id)}>{egg.textTrigger}</span>
      {text.slice(at + egg.textTrigger.length)}
    </>
  );
}

/** 01 — accroche et invitation à scroller. */
export function Hero() {
  return (
    <section className="om-panel om-panel--hero" data-panel="01 Hero">
      <div className="om-hero-box">
        <div className="om-kicker">Portfolio</div>
        <h1 className="om-h1">
          Du problème terrain
          <br />
          au <em>produit vivant</em>.
        </h1>
        <p className="om-lede">
          CPO et Product Builder. Je cadre la stratégie, je prototype, je livre.
        </p>
        <div className="om-hint">
          <span className="om-hint-label">Scrollez</span>
          <span className="om-hint-arrow">↓</span>
        </div>
      </div>
    </section>
  );
}

/** 02 — le profil hybride. */
/**
 * Le corps est une chaîne et non du JSX : c'est ce qui permet d'y découper un
 * déclencheur d'easter egg sans figer sa position dans le balisage.
 */
const QUI_BODY =
  "Je m'appelle Thibaut. Ingénieur de formation, ce qui m'anime depuis toujours, c'est d'aller sur le terrain, de comprendre un problème humain ou métier, et de concevoir la solution de bout en bout. Pour moi, la tech et l'IA sont des leviers concrets, jamais des gadgets, que je mobilise avec rigueur et exigence.";

export function Qui({ onEgg }: { onEgg?: (id: string) => void }) {
  return (
    <section className="om-panel om-panel--center" data-panel="02 Qui">
      <div className="om-kicker">Qui je suis</div>
      <h2 className="om-h2 om-h2--center">
        Partir du réel,
        <br />
        <em>bâtir sans artifice</em>.
      </h2>
      <p className="om-body">
        <TextWithEgg text={QUI_BODY} onEgg={onEgg} />
      </p>
    </section>
  );
}

const LEVIERS = [
  {
    title: 'Stratégie produit',
    desc: 'Aligner vision produit et enjeux business. Arbitrer les investissements et naviguer le paysage technologique.',
  },
  {
    title: 'Leadership & ops',
    desc: 'Culture user-first et rigueur opérationnelle. Structurer les équipes pour passer du POC à la production.',
  },
  {
    title: 'Hybridité tech',
    desc: 'Démystifier la GenAI et les APIs pour embarquer équipes et clients. Intégrer data et IA sans folklore.',
  },
];

/** 03 — les trois leviers. */
export function Methode() {
  return (
    <section className="om-panel om-panel--methode" data-panel="03 Méthode">
      <div className="om-kicker">Ma méthode</div>
      <h2 className="om-h2">
        Trois leviers, <em>un seul</em> objectif.
      </h2>
      <div className="om-grid om-grid--method">
        {LEVIERS.map((l, i) => (
          <div className="om-card" key={l.title}>
            <div className="om-card-num">{String(i + 1).padStart(2, '0')}</div>
            <h3 className="om-h3">{l.title}</h3>
            <p className="om-card-body">{l.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 04 — la timeline des expériences. */
export function Parcours() {
  return (
    <section className="om-panel om-panel--parcours" data-panel="04 Parcours">
      <div className="om-kicker">Parcours</div>
      <h2 className="om-h2">
        Dix ans à <em>rendre livrable</em> ce qui est complexe.
      </h2>
      <div className="om-timeline">
        {EXPERIENCES.map((exp) => (
          <div className={'om-xp' + (exp.current ? ' om-xp--current' : '')} key={exp.role + exp.period}>
            <div className="om-xp-period">{exp.period}</div>
            <div>
              <div className="om-xp-role">{exp.role}</div>
              <div className="om-xp-company">{exp.company}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 05 — les produits en ligne. */
export function Projets({ onEgg }: { onEgg?: (id: string) => void }) {
  return (
    <section className="om-panel om-panel--projets" data-panel="05 Projets">
      <div className="om-kicker">Ce que je construis</div>
      <h2 className="om-h2">
        Mes deux projets <em>personnels</em>.
      </h2>
      <div className="om-grid om-grid--projects">
        {PROJECTS.map((project) => (
          <div key={project.title}>
            <div className="om-project-head">
              <h3>{project.title}</h3>
              <span className="om-badge">{project.badge}</span>
            </div>
            <p className="om-project-body">
              <TextWithEgg text={project.desc} onEgg={onEgg} />
            </p>
            <div className="om-stack">
              <TextWithEgg text={project.stack} onEgg={onEgg} />
            </div>
            <a className="om-link" href={project.href} target="_blank" rel="noreferrer">
              {project.cta} →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 06 — les explorations sans garantie de résultat. */
export function Laboratoire({ onEgg }: { onEgg?: (id: string) => void }) {
  return (
    <section className="om-panel om-panel--lab" data-panel="06 Laboratoire">
      <div className="om-kicker">Le laboratoire</div>
      <h2 className="om-h2">
        Mes projets <em>exploratoires</em>.
      </h2>
      <div className="om-grid om-grid--lab">
        {LAB.map((entry) => (
          <div className="om-card" key={entry.title}>
            <div className="om-lab-head">
              <h3>{entry.title}</h3>
              <span className={'om-status' + (entry.status === 'Archivé' ? ' om-status--archived' : '')}>
                {entry.status}
              </span>
            </div>
            <p className="om-lab-body">
              <TextWithEgg text={entry.desc} onEgg={onEgg} />
            </p>
            <div className="om-lab-stack">{entry.stack}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 07 — l'appel à échanger. */
export function Contact() {
  return (
    <section className="om-panel om-panel--center" data-panel="07 Contact">
      <div className="om-kicker">Parlons-en</div>
      <h2 className="om-h2 om-h2--contact">
        Un besoin de renfort,
        <br />
        un projet à <em>concrétiser</em> ?
      </h2>
      <div className="om-contact-actions">
        <a className="om-chip" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>
        {CONTACT.links.map((link) => (
          <a className="om-chip om-chip--ghost" href={link.href} target="_blank" rel="noreferrer" key={link.label}>
            {link.label}
          </a>
        ))}
      </div>
      <div className="om-copyright">© 2026 Thibaut Sainrat</div>
    </section>
  );
}

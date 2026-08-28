import { useEffect, useRef, useState } from 'react';

/** Plafond de la jauge : trois chiffres, pour que l'affichage ne saute pas. */
const MAX_POWER = 999;
/** Au-delà de ce silence, on considère que l'utilisateur a décroché. */
const IDLE_MS = 500;
const CELLS = 24;

/**
 * Le module du Laboratoire, repris de l'ancien portfolio et rhabillé.
 *
 * La mécanique est l'argument : la puissance du vote se charge tant qu'on reste
 * réellement actif dans le cadre, et retombe dès qu'on s'arrête. C'est
 * l'Engagement-Weighted Voting — un vote pèse ce qu'on lui a consacré, pas la
 * vitesse à laquelle on a cliqué.
 */
export function MusicBattleDemo() {
  const [power, setPower] = useState(0);
  const [active, setActive] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const lastMove = useRef(0);

  useEffect(() => {
    if (sent !== null) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const idle = performance.now() - lastMove.current > IDLE_MS;
      setActive(!idle);
      if (!idle) setPower((p) => Math.min(p + 1, MAX_POWER));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sent]);

  // Après l'envoi, on rejoue : la démo n'a d'intérêt que répétée.
  useEffect(() => {
    if (sent === null) return;
    const t = window.setTimeout(() => {
      setSent(null);
      setPower(0);
    }, 2600);
    return () => window.clearTimeout(t);
  }, [sent]);

  const engage = () => {
    lastMove.current = performance.now();
  };

  const filled = Math.round((power / MAX_POWER) * CELLS);

  return (
    <div className="om-demo" onMouseMove={engage} onTouchMove={engage}>
      {sent === null ? (
        <>
          <div className="om-demo-label">Puissance du vote</div>
          <div className={'om-demo-score' + (active ? ' om-demo-score--live' : '')}>
            {String(power).padStart(3, '0')}
          </div>
          <div className="om-demo-gauge" role="presentation">
            {Array.from({ length: CELLS }, (_, i) => (
              <span key={i} className={'om-demo-cell' + (i < filled ? ' om-demo-cell--on' : '')} />
            ))}
          </div>
          <button className="om-demo-vote" type="button" onClick={() => setSent(power)} disabled={power === 0}>
            Voter
          </button>
          <div className="om-demo-hint">
            {active ? 'Engagement en cours…' : 'Bougez la souris dans ce cadre pour charger'}
          </div>
        </>
      ) : (
        <div className="om-demo-sent">
          <div className="om-demo-label">Vote envoyé</div>
          <div className="om-demo-score">{String(sent).padStart(3, '0')}</div>
          <div className="om-demo-hint">Pondéré par l'engagement, pas par la vitesse du clic.</div>
        </div>
      )}
    </div>
  );
}

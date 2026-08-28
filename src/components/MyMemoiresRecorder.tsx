import { useEffect, useRef, useState } from 'react';

/**
 * L'enregistreur de MyMémoires, cinquième peau : « Pixel ».
 *
 * Conforme au contrat de peinture du handoff `design_handoff_skins_enregistreur` :
 * un skin repeint l'objet, il ne le réorganise jamais. Les sept emplacements
 * gardent leurs cotes — ligne de face 13, bobines 74 espacées de 14, créneau
 * 44 × 30, compteur 15, châssis 243 × 64, capuchons 150 et 84 de course 8,
 * légendes 8 / interligne 10 / offset 7 — et seule la matière change.
 *
 * Deux règles du contrat respectées à la lettre :
 * — la bande est le compteur : la galette migre de gauche à droite ;
 * — la disquette de « Sauvegarder » est repeinte, jamais remplacée.
 *
 * Rien n'est capté : ni micro, ni permission, ni donnée. Le vumètre est une
 * marche aléatoire — un easter egg n'a pas à réclamer l'accès au matériel.
 */

const VU_BARS = 5;
const TEETH = 8;
const TICK_MS = 110;
/** Les deux bobines sont identiques, à moitié remplies. */
const PACK_HALF = 51;

type Phase = 'idle' | 'recording' | 'paused';

export function MyMemoiresRecorder() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(VU_BARS).fill(0.1));
  const [tooth, setTooth] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    if (phase !== 'recording') return;
    const pulse = window.setInterval(() => {
      setLevels((previous) => previous.map(() => 0.15 + Math.random() * 0.85));
      // Les dents avancent d'un cran : pas de rotation continue, qui trahirait
      // le pixel. C'est le déplacement discret qui donne le mouvement.
      setTooth((t) => (t + 1) % TEETH);
    }, TICK_MS);
    const clock = window.setInterval(() => {
      elapsed.current += 1;
      setSeconds(elapsed.current);
    }, 1000);
    return () => {
      window.clearInterval(pulse);
      window.clearInterval(clock);
    };
  }, [phase]);

  /** La touche principale bascule enregistrement / pause — elle ne termine rien.
   *  Reprendre après une pause continue le chrono au lieu de le remettre à zéro. */
  const toggle = () => {
    if (phase === 'recording') {
      setPhase('paused');
      return;
    }
    if (phase === 'idle') {
      elapsed.current = 0;
      setSeconds(0);
    }
    setPhase('recording');
  };

  const reset = () => {
    elapsed.current = 0;
    setSeconds(0);
    setLevels(Array(VU_BARS).fill(0.1));
    setPhase('idle');
  };

  const recording = phase === 'recording';
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const reel = () => (
    <div className="om-mm-reel">
      <span className="om-mm-pack" style={{ width: PACK_HALF, height: PACK_HALF }} />
      <span className="om-mm-hub" />
      {Array.from({ length: TEETH }, (_, i) => (
        <span
          key={i}
          className={'om-mm-tooth' + (tooth === i ? ' om-mm-tooth--on' : '')}
          data-tooth={i}
        />
      ))}
    </div>
  );

  return (
    <div className="om-mm">
      <div className="om-mm-face">Face A · skin pixel</div>

      <div className="om-mm-reels">
        {reel()}
        <div className="om-mm-slot" role="presentation">
          {levels.map((level, i) => (
            <span
              key={i}
              className="om-mm-vu"
              style={{ height: `${Math.max(1, Math.round(level * 6)) * 4}px` }}
            />
          ))}
        </div>
        {reel()}
      </div>

      <div className="om-mm-counter">{mmss}</div>

      {/* Le châssis ne contient que les capuchons : les légendes vivent dessous,
          à 7 d'offset, pour que le bloc fasse bien 64 + 7 + 10 = 81. */}
      <div className="om-mm-keyblock">
        <div className="om-mm-keys">
          <button
            className={'om-mm-cap om-mm-cap--main' + (recording ? ' om-mm-cap--down' : '')}
            type="button"
            onClick={toggle}
          >
            {recording ? (
              <>
                <span className="om-mm-pause" />
                <span className="om-mm-pause" />
              </>
            ) : (
              <span className="om-mm-rec" />
            )}
          </button>

          <button
            className="om-mm-cap om-mm-cap--save"
            type="button"
            onClick={reset}
          >
            {/* La disquette est repeinte, jamais remplacée — règle du contrat. */}
            <span className="om-mm-floppy">
              <span className="om-mm-floppy-shutter" />
              <span className="om-mm-floppy-label" />
            </span>
          </button>
        </div>

        <div className="om-mm-legends">
          <div className="om-mm-legend om-mm-legend--main">
            {recording ? 'Mettre en pause' : 'Enregistrer'}
          </div>
          <div className="om-mm-legend om-mm-legend--save">Sauvegarder</div>
        </div>
      </div>
    </div>
  );
}

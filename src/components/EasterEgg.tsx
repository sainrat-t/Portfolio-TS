import { useEffect, useRef, useState } from 'react';
import type { Egg } from '../data/eggs';
import { MusicBattleDemo } from './MusicBattleDemo';
import { MyMemoiresRecorder } from './MyMemoiresRecorder';

/**
 * Le code de déblocage se copie d'un clic. `navigator.clipboard` exige un
 * contexte sécurisé — https ou localhost ; ailleurs l'échec est silencieux et le
 * code reste sélectionnable à la main.
 */
function CodeChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* presse-papiers indisponible : le code reste lisible et sélectionnable */
    }
  };

  return (
    <button
      className="om-egg-code-value"
      type="button"
      onClick={copy}
      aria-label={`Copier le code ${value}`}
      style={{ minWidth: `${value.length}ch` }}
    >
      {copied ? 'Copié !' : value}
    </button>
  );
}

interface Props {
  egg: Egg;
  found: number;
  total: number;
  onClose: () => void;
}

/**
 * Fenêtre à la Windows 95 relue dans la DA du site : la structure est celle
 * d'une fenêtre — barre de titre, corps, barre d'état — mais le chrome est rendu
 * avec le vocabulaire de la page. Le chrome est franchement pixellisé (cadre
 * épais, coins en escalier, croix en blocs) pour appartenir à la matière du
 * panorama ; le contenu, lui, reste éditorial.
 */
export function EasterEgg({ egg, found, total, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="om-egg-backdrop" onClick={onClose}>
      <div
        className="om-egg"
        role="dialog"
        aria-modal="true"
        aria-label={egg.window}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="om-egg-frame">
          <div className="om-egg-bar">
            <span className="om-egg-bar-title">{egg.window}</span>
            {/* La croix est dessinée en CSS, en blocs : pas de glyphe de police. */}
            <button
              className="om-egg-close"
              type="button"
              onClick={onClose}
              ref={closeRef}
              aria-label="Fermer"
            />
          </div>

          <div className="om-egg-body">
            {egg.image && <img className="om-egg-image" src={egg.image.src} alt={egg.image.alt} />}
            {egg.icon ? (
              <div className="om-egg-head">
                <img className="om-egg-icon" src={egg.icon.src} alt="" />
                <h2 className="om-egg-title">{egg.title}</h2>
              </div>
            ) : (
              <h2 className="om-egg-title">{egg.title}</h2>
            )}
            {egg.body?.map((line) => (
              <p className="om-egg-text" key={line.slice(0, 24)}>
                {line}
              </p>
            ))}
            {egg.demo === 'music-battle' && <MusicBattleDemo />}
            {egg.demo === 'mymemoires' && <MyMemoiresRecorder />}
            {(egg.link || egg.code) && (
              <div className="om-egg-actions">
                {egg.link && (
                  <a className="om-egg-link" href={egg.link.href} target="_blank" rel="noreferrer">
                    {egg.link.label} →
                  </a>
                )}
                {egg.code && (
                  <p className="om-egg-code">
                    {egg.code.label} : <CodeChip value={egg.code.value} />
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="om-egg-status">
            <span>Easter eggs</span>
            <span>
              {String(found).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

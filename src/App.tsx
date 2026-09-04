import { useEffect, useRef, useState } from 'react';
import { ART_HEIGHT, PANELS, drawPanorama } from './panorama/draw';
import { clamp01 } from './panorama/utils';
import { Contact, Hero, Laboratoire, Methode, Parcours, Projets, Qui } from './components/panels';
import { EasterEgg } from './components/EasterEgg';
import { EGGS, EGGS_BY_ID, readFoundEggs, writeFoundEggs, type Egg } from './data/eggs';

/** Au-delà de ce progress, le ciel est bleu nuit : l'encre bascule en tons clairs. */
const NIGHT_AT = 0.71;
/** Boucle de rendu bridée à ~30 fps. */
const FRAME_MS = 33;
/** Durée du tween de navigation, en ms. */
const TWEEN_MS = 640;

/** Index de panneau visé par chaque entrée de navigation. */
const NAV = { home: 0, methode: 2, parcours: 3, projets: 4, contact: 6 };

/** Taille minimale d'une zone d'easter egg, en px CSS — le lama est plus petit que ça. */
const MIN_HIT = 44;

/**
 * Luminances du disque solaire entre lesquelles l'encre claire relaie l'encre
 * sombre sous le soleil. Au zénith l'astre est un jaune franc : le texte sombre
 * s'y détache très bien, l'éclaircir le dégraderait. En descendant, le disque
 * vire au rouge brique de l'accent et le rapport s'inverse — passé SUN_INK_NONE
 * l'encre claire commence à gagner, à SUN_INK_FULL elle a franchement gagné.
 * Le fondu est calé sur le corps de texte en gris moyen : c'est lui qui bascule
 * le premier, et c'est lui que le soleil traverse le plus souvent.
 */
const SUN_INK_NONE = 0.42;
const SUN_INK_FULL = 0.3;

/**
 * Marge de scroll ajoutée sur mobile, en px. La course y est figée sur la hauteur
 * mesurée au chargement ; cette réserve garantit que `progress` atteint bien 1
 * même quand la barre d'URL rétractée agrandit le viewport.
 */
const URLBAR_SLACK = 140;

/**
 * L'ordre des panneaux — sa longueur doit rester égale à `PANELS`. Il est rendu
 * deux fois : la page elle-même, et sa doublure en encre claire sous le soleil.
 * D'où la factorisation : les deux copies doivent être identiques au pixel près,
 * `onEgg` compris, puisque le déclencheur d'egg y ajoute un `<span>`.
 */
function Panels({ onEgg }: { onEgg: (id: string) => void }) {
  return (
    <>
      <Hero />
      <Qui onEgg={onEgg} />
      <Methode />
      <Parcours />
      <Projets onEgg={onEgg} />
      <Laboratoire onEgg={onEgg} />
      <Contact />
    </>
  );
}

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitsRef = useRef<HTMLDivElement>(null);
  const sunInkRef = useRef<HTMLDivElement>(null);
  const sunTrackRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(index: number) => void>(() => {});

  const [openEgg, setOpenEgg] = useState<Egg | null>(null);
  const [found, setFound] = useState<string[]>(readFoundEggs);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const hitLayer = hitsRef.current;
    const sunInk = sunInkRef.current;
    const sunTrack = sunTrackRef.current;
    if (!scroller || !sticky || !track || !canvas || !hitLayer || !sunInk || !sunTrack) return;

    /** Les deux copies de la page : l'encre sombre, et l'encre claire du calque solaire. */
    const tracks = [track, sunTrack];

    let progress = 0;
    let clock = 0;
    let raf = 0;
    let tween = 0;
    let lastFrame = 0;
    let canvasCssH = 0;
    const t0 = performance.now();

    // Sur mobile, la barre d'URL se rétracte pendant le scroll : `innerHeight` change
    // en plein geste. Recalculer la course à ce moment-là déplace le sol sous les pieds
    // — le carrousel saute latéralement sans que le doigt ait bougé. On fige donc la
    // course et on ne la remesure qu'à la rotation, où la largeur change aussi.
    // Le desktop garde la mesure dynamique : y redimensionner la fenêtre est délibéré.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let lockedH = 0;
    let lockedW = 0;
    /** Course de scroll figée (mobile) ; 0 sur desktop, où on la mesure à chaque tick. */
    let travel = 0;

    // Le scroller fait exactement PANELS viewports, le sticky un seul : on mesure
    // en pixels pour que le calcul de progress ne dépende pas de l'unité CSS.
    const measure = () => {
      const vh = window.innerHeight;
      if (coarse) {
        if (!lockedH || window.innerWidth !== lockedW) {
          lockedH = vh;
          lockedW = window.innerWidth;
        }
        scroller.style.height = `${PANELS * lockedH + URLBAR_SLACK}px`;
        travel = (PANELS - 1) * lockedH;
      } else {
        scroller.style.height = `${PANELS * vh}px`;
        travel = 0;
      }
      // Le sticky suit toujours le viewport : le décor doit couvrir l'écran.
      sticky.style.height = `${vh}px`;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvasCssH = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    /** Dernier état posé sur le calque solaire : ne rien réécrire tant qu'il n'a pas bougé. */
    let sunKey = '';

    // Le calque d'encre claire comme les boîtes cliquables viennent du dessin
    // lui-même, en unités d'art : ni l'un ni les autres ne peuvent dériver du
    // décor. On les replace à chaque peinture.
    const paint = () => {
      const { hits, sun } = drawPanorama(canvas, { progress, clock, viewportWidth: window.innerWidth });
      const perArt = canvasCssH / ART_HEIGHT;

      // Le disque du soleil, converti en pixels CSS pour découper le calque
      // d'encre claire. La découpe vit dans le repère du viewport : elle est
      // donc portée par le calque, jamais par la piste, qui elle défile.
      const sunPx =
        sun && perArt
          ? {
              x: (sun.x * perArt).toFixed(1),
              y: (sun.y * perArt).toFixed(1),
              // Un pixel de retrait : le disque est peint en pixel-art, son bord
              // réel reste en deçà du cercle théorique. Sans ce retrait, un bout
              // de lettre claire déborderait sur le ciel, où il disparaîtrait.
              r: Math.max(0, sun.r * perArt - 1).toFixed(1),
              // Deux fondus se multiplient : la bascule sombre → clair au fil
              // de l'assombrissement du disque, et l'effacement du soleil à la
              // tombée de la nuit.
              a: (
                sun.a * clamp01((SUN_INK_NONE - sun.l) / (SUN_INK_NONE - SUN_INK_FULL))
              ).toFixed(3),
            }
          : null;
      const key = sunPx && sunPx.a !== '0.000' ? `${sunPx.x} ${sunPx.y} ${sunPx.r} ${sunPx.a}` : '';
      if (key !== sunKey) {
        sunKey = key;
        // Invisible = hors rendu : rien à découper ni à rastériser tant que
        // le soleil est trop haut pour gêner, ou déjà couché.
        sunInk.style.display = key ? 'block' : 'none';
        if (sunPx) {
          sunInk.style.opacity = sunPx.a;
          sunInk.style.setProperty('--sun-x', `${sunPx.x}px`);
          sunInk.style.setProperty('--sun-y', `${sunPx.y}px`);
          sunInk.style.setProperty('--sun-r', `${sunPx.r}px`);
        }
      }

      const byId = new Map(hits.map((h) => [h.id, h]));
      for (const node of Array.from(hitLayer.children) as HTMLElement[]) {
        const box = byId.get(node.dataset.egg || '');
        if (!box || !perArt) {
          node.style.display = 'none';
          continue;
        }
        const w = Math.max(MIN_HIT, box.w * perArt);
        const h = Math.max(MIN_HIT, box.h * perArt);
        node.style.display = 'block';
        node.style.left = `${(box.x + box.w / 2) * perArt - w / 2}px`;
        node.style.top = `${(box.y + box.h / 2) * perArt - h / 2}px`;
        node.style.width = `${w}px`;
        node.style.height = `${h}px`;
      }
    };

    // Seule source de vérité : la position du scroller dans le viewport.
    const tick = () => {
      const max = travel || scroller.offsetHeight - sticky.offsetHeight;
      progress = max > 0 ? clamp01(-scroller.getBoundingClientRect().top / max) : 0;
      sticky.dataset.night = progress > NIGHT_AT ? '1' : '0';

      const first = track.firstElementChild;
      const panelWidth = first ? first.getBoundingClientRect().width : sticky.clientWidth;
      const shift = `translate3d(${-progress * (PANELS - 1) * panelWidth}px,0,0)`;
      for (const layer of tracks) layer.style.transform = shift;

      // Les panneaux voisins s'effacent et glissent légèrement : un seul est net.
      // Le calque solaire rejoue exactement la même page : il reçoit les mêmes
      // valeurs, sans quoi son encre claire décalerait d'avec les lettres.
      for (let i = 0; i < PANELS; i++) {
        const opacity = Math.max(0, 1 - Math.abs(progress * (PANELS - 1) - i) * 1.45);
        const alpha = opacity.toFixed(3);
        const slide = `translateY(${((1 - opacity) * 22).toFixed(1)}px)`;
        for (const layer of tracks) {
          const panel = layer.children[i] as HTMLElement | undefined;
          if (!panel) continue;
          panel.style.opacity = alpha;
          panel.style.transform = slide;
        }
      }

      paint();
    };

    const cancelTween = () => {
      if (tween) cancelAnimationFrame(tween);
      tween = 0;
    };

    // Navigation : tween JS sur le scroll, interrompu dès que l'utilisateur reprend la main.
    jumpRef.current = (index: number) => {
      const max = travel || scroller.offsetHeight - sticky.offsetHeight;
      const from = window.scrollY;
      const to = from + scroller.getBoundingClientRect().top + (index / (PANELS - 1)) * max;
      cancelTween();
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / TWEEN_MS);
        const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        window.scrollTo(0, Math.round(from + (to - from) * eased));
        tick();
        tween = k < 1 ? requestAnimationFrame(step) : 0;
      };
      tween = requestAnimationFrame(step);
    };

    // Mobile : les évènements de scroll partent plusieurs fois par image pendant
    // l'inertie tactile, et chacun redessinait 845 rectangles. On n'en garde qu'un
    // par image. Le desktop tient largement le rythme, on n'y touche pas.
    let queued = 0;
    const onScroll = coarse
      ? () => {
          if (queued) return;
          queued = requestAnimationFrame(() => {
            queued = 0;
            tick();
            // Ce repaint compte pour l'horloge 30 fps : inutile d'en refaire un.
            lastFrame = performance.now();
          });
        }
      : () => tick();
    const onResize = () => {
      measure();
      resizeCanvas();
      tick();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', cancelTween, { passive: true });
    window.addEventListener('touchstart', cancelTween, { passive: true });
    window.addEventListener('keydown', cancelTween);

    const observer = new ResizeObserver(onResize);
    observer.observe(sticky);

    measure();
    resizeCanvas();
    tick();
    // Second passage une fois les polices chargées : la largeur des panneaux peut bouger.
    const warm = window.setTimeout(tick, 400);

    // Horloge indépendante du scroll : la rame roule, les pales tournent, même à l'arrêt.
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      clock = t - t0;
      if (t - lastFrame < FRAME_MS) return;
      const rect = sticky.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        lastFrame = t;
        paint();
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (queued) cancelAnimationFrame(queued);
      cancelTween();
      window.clearTimeout(warm);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', cancelTween);
      window.removeEventListener('touchstart', cancelTween);
      window.removeEventListener('keydown', cancelTween);
    };
  }, []);

  // L'écriture est un effet, pas un effet de bord dans l'updater de `setFound` :
  // React peut réexécuter un updater plusieurs fois, il doit rester pur.
  useEffect(() => {
    writeFoundEggs(found);
  }, [found]);

  // La fenêtre vit dans le conteneur sticky : elle reste donc calée sur le
  // viewport pendant que le décor défile derrière, et ne se ferme qu'à la demande.
  useEffect(() => {
    for (const layer of [trackRef.current, sunTrackRef.current]) {
      layer?.classList.toggle('om-track--dimmed', openEgg !== null);
    }
  }, [openEgg]);

  const jump = (index: number) => (event: { preventDefault: () => void }) => {
    event.preventDefault();
    jumpRef.current(index);
  };

  const openEggById = (id: string) => {
    const egg = EGGS_BY_ID[id];
    if (!egg) return;
    setOpenEgg(egg);
    setFound((previous) => (previous.includes(id) ? previous : [...previous, id]));
  };

  return (
    <div className="om-page">
      <div className="om-scroller" ref={scrollerRef}>
        <div className="om-sticky" ref={stickyRef} data-night="0">
          <canvas className="om-canvas" ref={canvasRef} aria-hidden="true" />

          <header className="om-header">
            <a className="om-logo" href="#" onClick={jump(NAV.home)}>
              Thibaut Sainrat<span>.</span>
            </a>
            <nav className="om-nav">
              <button className="om-nav-link" type="button" onClick={jump(NAV.methode)}>
                Méthode
              </button>
              <button className="om-nav-link" type="button" onClick={jump(NAV.parcours)}>
                Parcours
              </button>
              <button className="om-nav-link" type="button" onClick={jump(NAV.projets)}>
                Projets
              </button>
              <button className="om-pill" type="button" onClick={jump(NAV.contact)}>
                On discute ?
              </button>
            </nav>
          </header>

          <div className="om-track" ref={trackRef}>
            <Panels onEgg={openEggById} />
          </div>

          {/* Le soleil passe derrière le texte : les caractères qu'il recouvre
              basculent en encre claire, la seule lisible sur le disque une fois
              celui-ci descendu dans les rouges. C'est la page entière rejouée
              en clair, puis découpée au disque — une découpe ne connaît pas les
              lettres, elle coupe au pixel : la bascule suit donc exactement le
              bord du soleil, quitte à trancher un caractère en deux. */}
          <div className="om-sun-ink" ref={sunInkRef} aria-hidden="true" inert>
            <div className="om-track" ref={sunTrackRef}>
              <Panels onEgg={openEggById} />
            </div>
          </div>

          <div className="om-hits" ref={hitsRef} aria-hidden="true">
            {EGGS.map((egg) => (
              <div
                className="om-hit"
                key={egg.id}
                data-egg={egg.id}
                style={{ display: 'none' }}
                onClick={() => openEggById(egg.id)}
              />
            ))}
          </div>

          {openEgg && (
            <EasterEgg
              egg={openEgg}
              found={found.length}
              total={EGGS.length}
              onClose={() => setOpenEgg(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

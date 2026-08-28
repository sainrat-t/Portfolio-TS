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

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitsRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(index: number) => void>(() => {});

  const [openEgg, setOpenEgg] = useState<Egg | null>(null);
  const [found, setFound] = useState<string[]>(readFoundEggs);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const hitLayer = hitsRef.current;
    if (!scroller || !sticky || !track || !canvas || !hitLayer) return;

    let progress = 0;
    let clock = 0;
    let raf = 0;
    let tween = 0;
    let lastFrame = 0;
    let canvasCssH = 0;
    const t0 = performance.now();

    // Le scroller fait exactement PANELS viewports, le sticky un seul : on mesure
    // en pixels pour que le calcul de progress ne dépende pas de l'unité CSS.
    const measure = () => {
      const vh = window.innerHeight;
      scroller.style.height = `${PANELS * vh}px`;
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

    // Les boîtes cliquables viennent du dessin lui-même, en unités d'art : elles
    // ne peuvent donc pas dériver du décor. On les repositionne à chaque peinture.
    const paint = () => {
      const hits = drawPanorama(canvas, { progress, clock, viewportWidth: window.innerWidth });
      const perArt = canvasCssH / ART_HEIGHT;
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
      const max = scroller.offsetHeight - sticky.offsetHeight;
      progress = max > 0 ? clamp01(-scroller.getBoundingClientRect().top / max) : 0;
      sticky.dataset.night = progress > NIGHT_AT ? '1' : '0';

      const first = track.firstElementChild;
      const panelWidth = first ? first.getBoundingClientRect().width : sticky.clientWidth;
      track.style.transform = `translate3d(${-progress * (PANELS - 1) * panelWidth}px,0,0)`;

      // Les panneaux voisins s'effacent et glissent légèrement : un seul est net.
      for (let i = 0; i < track.children.length; i++) {
        const panel = track.children[i] as HTMLElement;
        const opacity = Math.max(0, 1 - Math.abs(progress * (PANELS - 1) - i) * 1.45);
        panel.style.opacity = opacity.toFixed(3);
        panel.style.transform = `translateY(${((1 - opacity) * 22).toFixed(1)}px)`;
      }

      paint();
    };

    const cancelTween = () => {
      if (tween) cancelAnimationFrame(tween);
      tween = 0;
    };

    // Navigation : tween JS sur le scroll, interrompu dès que l'utilisateur reprend la main.
    jumpRef.current = (index: number) => {
      const max = scroller.offsetHeight - sticky.offsetHeight;
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

    const onScroll = () => tick();
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
    trackRef.current?.classList.toggle('om-track--dimmed', openEgg !== null);
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
                Me parler
              </button>
            </nav>
          </header>

          <div className="om-track" ref={trackRef}>
            <Hero />
            <Qui onEgg={openEggById} />
            <Methode />
            <Parcours />
            <Projets onEgg={openEggById} />
            <Laboratoire onEgg={openEggById} />
            <Contact />
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

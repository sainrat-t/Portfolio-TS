import { RGB, clamp01, css, hexToRgb, lerpRgb, luminance, rand, smoothstep } from './utils';

/** Nombre de panneaux du carrousel : pilote la hauteur du scroller ET la largeur du monde. */
export const PANELS = 7;

/** Hauteur du monde en unités d'art. Voir `PanoramaOptions.artHeight`. */
export const ART_HEIGHT = 200;

/**
 * Boîte cliquable d'un élément du décor, en **unités d'art**, renvoyée par le
 * dessin lui-même. Les easter eggs s'appuient dessus plutôt que sur des
 * coordonnées recopiées : impossible qu'elles dérivent du décor.
 */
export interface PanoramaHit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Le métro aérien — viaduc, bouches de tunnel, rame — est dessiné sur une trame
 * plus fine que le reste du décor : à 1, la maçonnerie des bouches monte bien
 * au-dessus de la bande d'art et écrase les toits.
 */
const VIADUCT_SCALE = 0.7;

/**
 * Trame de la ligne 12 en coupe. Calée pour que la rame verte fasse la même
 * taille que la rame bleue du viaduc : 13 t ≈ 11 b en largeur, 5 t ≈ 4.3 b en
 * hauteur. Sans elle le souterrain écrasait le reste du décor.
 */
const TUNNEL_SCALE = 0.6;

/**
 * Niveau de la rue, en fraction de H. C'est le partage entre la surface et le
 * souterrain : la coupe de la ligne 12 se construisant depuis le bas de l'écran,
 * la couche de terre est exactement ce qui reste entre la chaussée et la voûte.
 * Descendre cette valeur amincit la terre et rend d'autant de hauteur au décor.
 */
const GROUND_FR = 0.86;

/**
 * Course de la lune. Elle traverse d'est en ouest comme le soleil (de la droite
 * vers la gauche) et suit un arc : elle se lève, culmine au milieu de la nuit,
 * puis redescend pour finir juste à droite de la basilique, dans la poche libre
 * entre le campanile, le bandeau de copyright (jusqu'à 0.61 H) et la crête.
 * Le départ est une fraction d'écran, l'arrivée se calcule sur la basilique :
 * `W` en unités d'art dépend du ratio de l'écran, donc une fraction fixe
 * plaquerait la lune sur le campanile en portrait.
 */
const MOON_FROM_X = 0.95;
const MOON_BASE_Y = 0.66;
const MOON_ARC_Y = 0.48;

/** Position du Sacré-Cœur dans le monde, en fraction de TOTAL. */
const SACRE_COEUR_FR = 0.905;

/**
 * La Tour Eiffel n'est pas un monument qu'on longe mais un repère d'horizon.
 * Elle est au dernier plan de la parallaxe — bien plus lente que les nuages — donc
 * elle bouge à peine latéralement : `EIFFEL_FR` la pose à 0.80 W au panneau 02,
 * franchement à droite du bloc de texte, qui s'arrête à 0.705 W.
 *
 * Sa trajectoire est en revanche un pur artifice, assumé : elle sort du sol, culmine
 * au panneau 02, puis se renfonce au milieu du panneau 03. La courbe est une cloche
 * hyperbolique `1/(1+x²)` et non une sinusoïde — elle jaillit, tient son sommet,
 * puis replonge, au lieu de monter et descendre à vitesse constante.
 */
const EIFFEL_FR = 0.1314;
const EIFFEL_PARA = 0.12;
const EIFFEL_ARC_FROM = 0;
const EIFFEL_ARC_TO = 1 / 3;
/** Plus la valeur est haute, plus le sommet est marqué et les traînées longues. */
const EIFFEL_SHARP = 3;
/**
 * Épaississement du fût. Reste proche de 1 : la massivité vient de la taille de
 * la tour, pas de sa déformation — au-delà, la partie visible devient trapue et
 * ne ressemble plus au vrai profil (le haut de la tour fait environ 5 fois plus
 * haut que large).
 */
const EIFFEL_GIRTH = 1.05;

const EIFFEL_PROFILE: Array<[number, number]> = [
  [0, 4.9],
  [0.09, 3.6],
  [0.173, 2.8],
  [0.35, 1.6],
  [0.6, 1.05],
  [0.836, 0.75],
  [0.94, 0.5],
  [1, 0.3],
];

/**
 * Parallaxe de la ligne 12 en coupe. Le tunnel est une structure rigide :
 * carrelage, traverses et quais la partagent, seule la rame file plus vite.
 */
const TUNNEL_PARA = 1.12;

/** L'aube : elle monte sur la toute fin, une fois la lune arrivée près de la basilique. */
const DAWN_AT = 0.88;
const DAWN_RAMP = 0.12;
const DAWN_ALPHA = 0.2;

/** Silhouette du lama — logo Studio Lamarck, viewBox 384×384. */
const LAMA_PATH =
  'M17.25,61.5l31.5,-2.25l0,-59.25l23.25,0l0,57.75l23.25,-1.5l0,-56.25l23.25,0l0,157.5c0,0 1.575,19.367 20.25,19.5c18.675,0.133 196.5,0 196.5,0c0,0 31.721,-1.9 31.5,31.5c-0.221,33.4 0,22.5 0,22.5l-23.25,0l0,-21c0,0 0.726,-9.334 -9.75,-9.75c-10.476,-0.416 -24.75,0 -24.75,0l0,183.75l-39.75,0l0,-95.25l-146.25,0l0,95.25l-39.75,0l0,-95.25c0,0 -23.211,-0.576 -23.25,-20.25c-0.039,-19.674 0,-168 0,-168l-42.75,0l0,-39Z';

/** Nuages en parallaxe — positions figées au chargement du module. */
const CLOUDS = Array.from({ length: 34 }, (_, i) => ({
  f: i / 34 + rand(i) * 0.03,
  y: 0.04 + rand(i + 90) * 0.34,
  s: 0.7 + rand(i + 40) * 1.5,
  p: 0.3 + rand(i + 7) * 0.25,
}));

/**
 * Tonneaux de la vigne. Contrairement aux nuages — qui passent par `rand()` et
 * sont donc identiques à chaque visite — leur position est tirée au chargement
 * du module, une fois par chargement de page : la parcelle n'est jamais tout à
 * fait la même deux fois. Tiré ici et pas dans `drawPanorama()`, qui s'exécute
 * ~30 fois par seconde.
 */
const BARRELS = Array.from({ length: 6 }, () => ({
  f: Math.random(), // position le long de la parcelle
  row: Math.floor(Math.random() * 3), // le rang où il est posé
  size: 0.85 + Math.random() * 0.4,
}));

let lamaSprite: HTMLCanvasElement | null = null;
let lamaSpriteLit: HTMLCanvasElement | null = null;

/** Rasterise le lama une fois pour toutes, en 30×30, pour un rendu « gros pixels ». */
function lamaSprites(): [HTMLCanvasElement, HTMLCanvasElement] | null {
  if (lamaSprite && lamaSpriteLit) return [lamaSprite, lamaSpriteLit];
  const flat = document.createElement('canvas');
  const litC = document.createElement('canvas');
  flat.width = flat.height = litC.width = litC.height = 30;
  const o = flat.getContext('2d');
  const l = litC.getContext('2d');
  if (!o || !l) return null;

  o.fillStyle = '#2a2721';
  o.scale(30 / 384, 30 / 384);
  o.fill(new Path2D(LAMA_PATH));

  const grad = l.createLinearGradient(0, 0, 30, 22);
  grad.addColorStop(0, 'rgb(255,226,164)');
  grad.addColorStop(0.55, 'rgb(190,150,96)');
  grad.addColorStop(1, 'rgb(74,60,48)');
  l.fillStyle = grad;
  l.save();
  l.scale(30 / 384, 30 / 384);
  l.fill(new Path2D(LAMA_PATH));
  l.restore();

  lamaSprite = flat;
  lamaSpriteLit = litC;
  return [flat, litC];
}

/**
 * Le soleil tel qu'il vient d'être peint, en **unités d'art**. Comme les boîtes
 * cliquables, il est renvoyé par le dessin plutôt que recalculé côté page :
 * l'encre claire ne peut donc pas dériver du disque qu'elle est censée suivre.
 */
export interface PanoramaSun {
  x: number;
  y: number;
  r: number;
  /** Opacité de peinture : le disque s'efface à la tombée de la nuit. */
  a: number;
  /**
   * Luminance relative du disque. Elle chute au fil de la descente — le jaune
   * du zénith vire au rouge brique de l'accent — et c'est elle qui décide de
   * quel côté penche la lisibilité du texte posé par-dessus.
   */
  l: number;
}

export interface PanoramaFrame {
  hits: PanoramaHit[];
  /** `null` quand le soleil est couché — plus rien à éclaircir. */
  sun: PanoramaSun | null;
}

export interface PanoramaOptions {
  /** 0 → 1, dérivé du scroll : caméra, cycle jour/nuit. */
  progress: number;
  /** Horloge indépendante du scroll (ms) : rame, pales, fumée, scintillement. */
  clock: number;
  /** Largeur réelle du viewport (px CSS) — pas les unités d'art. */
  viewportWidth: number;
  accent?: string;
  /**
   * Hauteur du monde en unités d'art. Ne change pas la taille du pixel (elle suit
   * la hauteur du canvas) mais l'échelle des monuments, dont le `u` est planché.
   * Le prototype de référence est à 140 : à cette valeur le Sacré-Cœur monte
   * jusqu'à mi-écran et chevauche le titre du panneau Contact. 200 le repose sur
   * la crête sans rien perdre du Moulin. Plage prévue par le design : 140 → 340.
   */
  artHeight?: number;
  /** À false, le panorama reste en plein jour et le cycle est désactivé. */
  dusk?: boolean;
}

export function drawPanorama(canvas: HTMLCanvasElement, opts: PanoramaOptions): PanoramaFrame {
  const hits: PanoramaHit[] = [];
  let sun: PanoramaSun | null = null;
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.width || !canvas.height) return { hits, sun };

  const p = clamp01(opts.progress);
  const clock = opts.clock || 0;
  const ART = Math.max(120, Math.min(420, opts.artHeight || ART_HEIGHT));
  const scale = canvas.height / ART;
  const W = canvas.width / scale;
  const H = ART;
  const accent = hexToRgb(opts.accent || '#c4452b');
  const dusk = opts.dusk !== false;

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // Cycle accéléré : le soleil est couché au niveau du Moulin (p ≈ 0.70).
  const dayP = Math.min(1, p / 0.66);
  const night = dusk ? smoothstep((p - 0.66) / 0.1) : 0;
  const tone = (d: RGB, k: RGB, n: RGB) => css(lerpRgb(lerpRgb(d, k, dayP), n, night));

  const skyDay: RGB = [239, 234, 213];
  const skyDusk: RGB = [248, 214, 178];
  const skyNight: RGB = [14, 16, 30];
  const skyRgb: RGB = dusk ? lerpRgb(lerpRgb(skyDay, skyDusk, dayP), skyNight, night) : skyDay;
  const sky = css(skyRgb);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  /** Un « pixel » du panorama : toujours arrondi à l'entier, sinon l'effet tombe. */
  const px = (x: number, y: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };

  const TOTAL = W * PANELS;
  const cam = p * (TOTAL - W);
  // Repères du monde : l'art vit entre CEIL (H*0.74) et l'eau (H*0.88) — la bande de
  // texte au-dessus reste lisible. Chaque hauteur d'élément est normalisée dans cette bande.
  const B = Math.max(2, Math.round(H / 70));
  const ground = H * GROUND_FR;
  const horizon = ground;

  /** Disque en pixel-art : soleil, lune, coupoles. */
  const disc = (cx: number, cy: number, rad: number, col: string, step: number, clipY?: number) => {
    for (let dy = -rad; dy <= rad; dy += step) {
      const w = Math.sqrt(Math.max(0, rad * rad - (dy + step / 2) * (dy + step / 2)));
      if (clipY != null && cy + dy > clipY) continue;
      px(cx - w, cy + dy, w * 2, step, col);
    }
  };

  // ── Ciel ────────────────────────────────────────────────────
  // Aube : sur la toute fin de la traversée, une lueur chaude monte de l'horizon.
  // Le lavis lui-même est posé plus bas, une fois les astres peints (voir plus loin).
  const dawn = dusk ? smoothstep((p - DAWN_AT) / DAWN_RAMP) : 0;
  // Étoiles — n'apparaissent qu'à la nuit.
  if (night > 0.02) {
    ctx.globalAlpha = night * 0.85;
    for (let st = 0; st < 46; st++) {
      const sxx = rand(st * 3.7) * W;
      const syy = rand(st * 5.1 + 9) * H * 0.55;
      const tw = 0.55 + 0.45 * Math.sin(clock / 900 + st);
      px(sxx, syy, Math.max(1, B * 0.4), Math.max(1, B * 0.4), 'rgba(255,250,235,' + tw.toFixed(2) + ')');
    }
    ctx.globalAlpha = 1;
  }

  // Soleil — plonge vite et disparaît sous la butte.
  const su = Math.max(1, B * 0.5);
  const sunX = W * 0.72 - dayP * W * 0.44;
  const sunY = H * 0.14 + dayP * (horizon - H * 0.06);
  const sunNoon: RGB = [246, 189, 63];
  const sunRgb = dusk ? lerpRgb(sunNoon, accent, Math.min(1, dayP * 1.2)) : sunNoon;
  const sunR = B * 3.2;
  if (night < 0.98) {
    ctx.globalAlpha = 1 - night;
    disc(sunX, sunY, sunR, css(sunRgb), su, horizon - B * 0.5);
    ctx.globalAlpha = 1;
    sun = { x: sunX, y: sunY, r: sunR, a: 1 - night, l: luminance(sunRgb) };
  }

  // Lune en croissant — elle se lève à mesure que le soleil se couche, puis
  // poursuit sa course jusqu'à `p = 1` pour se ranger à côté de la basilique.
  // Le smoothstep sur toute la fin de course la fait ralentir en arrivant.
  const mp = smoothstep((p - 0.56) / 0.44);
  if (dusk && mp > 0.01) {
    // Position de la basilique à p = 1, puis son campanile (~8.5 B), le rayon de
    // la lune (3.6 B) et un écart franc.
    const moonTo = SACRE_COEUR_FR * TOTAL - (TOTAL - W) + B * 15;
    const moonFrom = W * MOON_FROM_X;
    const moonX = moonFrom + mp * (moonTo - moonFrom);
    const moonY = H * (MOON_BASE_Y - Math.sin(mp * Math.PI) * MOON_ARC_Y);
    const mr = B * 3.6;
    ctx.globalAlpha = Math.min(1, mp * 1.6);
    disc(moonX, moonY, mr, 'rgb(250,240,214)', su);
    disc(moonX + mr * 0.62, moonY - mr * 0.16, mr * 0.94, sky, su); // l'ombre taille le croissant
    ctx.globalAlpha = 1;
  }

  // Nuages (parallaxe) — le ciel se dégage au rythme exact de la tombée de la
  // nuit : plus un nuage dès le Laboratoire, où ils encombraient le texte.
  if (night < 0.99) {
    ctx.globalAlpha = 1 - night;
    CLOUDS.forEach((cl) => {
      const x = ((cl.f * TOTAL - cam * cl.p) % TOTAL) - W * 0.2;
      if (x < -140 || x > W + 60) return;
      const y = cl.y * H;
      const u = B * cl.s;
      const col = 'rgba(255,253,246,.95)';
      px(x, y, u * 7, u, col);
      px(x + u, y - u, u * 4, u, col);
      px(x + u * 2, y - u * 2, u * 2, u, col);
      px(x - u, y + u, u * 8, u, 'rgba(255,253,246,.6)');
    });
    ctx.globalAlpha = 1;
  }

  // Lavis d'aube — posé après les astres et avant le décor : il baigne le ciel,
  // la lune et les étoiles, mais pas la ville. Peint en bandes de B plutôt qu'en
  // dégradé lisse, pour rester dans la trame.
  // C'est aussi ce qui évite un artefact : le croissant de lune est taillé en
  // repeignant un disque couleur `sky`, qui ne vaudrait plus rien sous la lueur.
  if (dawn > 0.01) {
    const dawnTop = H * 0.42;
    const dawnFull = H * 0.79; // au-delà, la crête masque le ciel de toute façon
    const bands = Math.max(1, Math.round((dawnFull - dawnTop) / B));
    for (let r = 0; r < bands; r++) {
      const k = (r + 1) / bands; // 0 en haut → 1 au ras de l'horizon
      px(0, dawnTop + r * B, W, B, 'rgba(' + accent.join(',') + ',' + (dawn * DAWN_ALPHA * k * k).toFixed(3) + ')');
    }
    px(0, dawnFull, W, ground - dawnFull + 2, 'rgba(' + accent.join(',') + ',' + (dawn * DAWN_ALPHA).toFixed(3) + ')');
  }

  // ── La Tour Eiffel, au loin ─────────────────────────────────
  // Silhouette délavée vers la couleur du ciel — c'est la brume qui la fait reculer,
  // pas sa taille. Dessinée avant tout le décor terrestre : elle sort de derrière la
  // ville et non devant elle.
  const eiffelArc = clamp01((p - EIFFEL_ARC_FROM) / (EIFFEL_ARC_TO - EIFFEL_ARC_FROM));
  const bell = (t: number) => 1 / (1 + Math.pow(EIFFEL_SHARP * (t - 0.5), 2));
  const eiffelLift = (bell(eiffelArc) - bell(0)) / (1 - bell(0));
  const eiffelX = EIFFEL_FR * TOTAL - cam * EIFFEL_PARA;
  if (eiffelLift > 0.002 && eiffelX > -B * 10 && eiffelX < W + B * 10) {
    const eiffelH = B * 24;
    const eu = eiffelH / 26;
    // Deux positions du pied, interpolées par la cloche. Le zinc des toits plafonne
    // vers 161 en unités d'art, et les deux positions restent dessous :
    // — sortie : seul le haut de la tour dépasse. Ses jambes écartées ne sont jamais
    //   visibles, ce qui l'empêche de sembler décoller du sol ;
    // — enfouie : le sommet lui-même passe sous les toits.
    const eiffelPeak = ground - B * 1.3;
    const eiffelBuried = ground - B * 2.3 + eiffelH + eu * 2;
    const eiffelBase = eiffelBuried + (eiffelPeak - eiffelBuried) * eiffelLift;

    const ironRgb = lerpRgb(lerpRgb([124, 98, 76], [118, 88, 74], dayP), [46, 44, 58], night);
    // La brume doit reculer la tour sans l'effacer : au-delà de ~0.5 elle se
    // confond avec le ciel à cette taille.
    const far = css(lerpRgb(ironRgb, skyRgb, 0.42));
    const farSoft = css(lerpRgb(ironRgb, skyRgb, 0.6));
    const strutW = Math.max(1, eu * 1.1);

    const halfAt = (k: number) => {
      for (let i = 1; i < EIFFEL_PROFILE.length; i++) {
        if (k <= EIFFEL_PROFILE[i][0]) {
          const [k0, w0] = EIFFEL_PROFILE[i - 1];
          const [k1, w1] = EIFFEL_PROFILE[i];
          return (w0 + ((w1 - w0) * (k - k0)) / (k1 - k0)) * eu * EIFFEL_GIRTH;
        }
      }
      return EIFFEL_PROFILE[EIFFEL_PROFILE.length - 1][1] * eu * EIFFEL_GIRTH;
    };

    const rows = 26;
    const rowH = eiffelH / (rows - 1);
    for (let r = 0; r < rows; r++) {
      const k = r / (rows - 1);
      const hw = halfAt(k);
      const y = eiffelBase - k * eiffelH;
      if (y > ground) continue; // ce qui est encore sous la rue ne se dessine pas
      if (hw <= strutW) {
        px(eiffelX - hw, y, Math.max(1, hw * 2), rowH + 0.8, far); // le fût se referme en haut
      } else {
        px(eiffelX - hw, y, strutW, rowH + 0.8, far); // montant gauche
        px(eiffelX + hw - strutW, y, strutW, rowH + 0.8, far); // montant droit
        // Treillis : suggéré une rangée sur deux, et jamais sous le 1er étage —
        // l'arche doit rester ouverte, c'est elle qui fait reconnaître la tour.
        if (r % 2 === 0 && k > 0.18) px(eiffelX - hw, y, hw * 2, Math.max(1, eu * 0.3), farSoft);
      }
    }

    // Arche du rez-de-chaussée, puis les trois plateformes.
    const platform = (k: number, over: number, h: number) => {
      const y = eiffelBase - k * eiffelH;
      if (y > ground) return;
      const hw = halfAt(k) + eu * over;
      px(eiffelX - hw, y, hw * 2, Math.max(1, h), far);
    };
    platform(0.1, 0.2, eu * 0.55); // arche
    platform(0.173, 0.7, eu * 0.9); // 1er étage
    platform(0.35, 0.6, eu * 0.8); // 2e étage
    platform(0.836, 0.5, eu * 0.7); // sommet
    const antennaY = eiffelBase - eiffelH - eu * 2;
    if (antennaY < ground) px(eiffelX - Math.max(1, eu * 0.35), antennaY, Math.max(1, eu * 0.7), eu * 2.2, far);
  }

  // ── Paris 18e ───────────────────────────────────────────────
  const ceilAt = (wx: number) => {
    const t = clamp01((wx / TOTAL - 0.74) / 0.2);
    return H * (0.775 - 0.175 * t);
  };
  const bandAt = (wx: number) => ground - ceilAt(wx);

  const lit = 'rgba(252,214,142,' + Math.min(0.98, 0.24 + dayP * 0.42 + night * 0.34).toFixed(2) + ')';
  const zinc = dusk ? tone([132, 138, 143], [120, 118, 126], [40, 43, 54]) : 'rgb(132,138,143)';
  const zincDark = dusk ? tone([104, 110, 116], [92, 90, 100], [28, 30, 38]) : 'rgb(104,110,116)';
  const stone = dusk ? tone([221, 210, 188], [216, 191, 172], [50, 47, 52]) : 'rgb(221,210,188)';
  const stoneDark = dusk ? tone([198, 185, 161], [190, 165, 148], [35, 33, 38]) : 'rgb(198,185,161)';
  const blue2 = dusk ? tone([0, 100, 173], [12, 78, 140], [16, 46, 82]) : 'rgb(0,100,173)';
  const blue2Soft = 'rgba(0,100,173,.5)';
  const green12 = dusk ? tone([0, 129, 79], [4, 104, 66], [6, 54, 40]) : 'rgb(0,129,79)';
  const iron = blue2;
  const green = dusk ? tone([124, 141, 96], [112, 120, 92], [22, 30, 27]) : 'rgb(124,141,96)';
  const greenTop = dusk ? tone([146, 163, 113], [132, 140, 106], [30, 40, 33]) : 'rgb(146,163,113)';
  // La basilique est illuminée la nuit : la pierre passe au blanc chaud des projecteurs.
  const ivory = dusk ? tone([246, 241, 229], [248, 232, 213], [252, 236, 198]) : 'rgb(246,241,229)';
  const ivoryShade = dusk ? tone([214, 206, 188], [214, 191, 173], [206, 172, 118]) : 'rgb(214,206,188)';
  const ivoryDeep = dusk ? tone([171, 162, 143], [168, 145, 130], [128, 96, 58]) : 'rgb(171,162,143)';

  // La Butte — la pente qui soulève toute la seconde moitié.
  const bStart = 0.44;
  const bTopAt = 0.92;
  const butteH = (wx: number) => {
    const fr = wx / TOTAL;
    const t = (fr - bStart) / (bTopAt - bStart);
    if (t <= 0) return 0;
    const up = bandAt(wx) * (0.06 + 0.42 * Math.pow(smoothstep(Math.min(1, t)), 1.25));
    if (fr <= bTopAt) return up;
    return up * (1 - 0.66 * smoothstep((fr - bTopAt) / 0.07)); // versant nord, après la basilique
  };
  for (let x = 0; x < W; x += B) {
    const h = butteH(cam + x);
    if (h <= 0) continue;
    const top = ground - h;
    px(x, top, B, ground - top + 2, green);
    px(x, top, B, B, greenTop);
  }

  // Escaliers de la Butte + lampadaires.
  const sFrom = TOTAL * 0.6;
  const sTo = TOTAL * 0.76;
  // Repéré par comptage et non par indice de boucle : le repère tient même si la
  // condition d'affichage des lampadaires change.
  let lampCount = 0;
  for (let k = 0; k < 46; k++) {
    const wx = sFrom + (k / 46) * (sTo - sFrom);
    if (wx < cam - 40 || wx > cam + W + 20) continue;
    const y = ground - butteH(wx);
    px(wx - cam, y, (sTo - sFrom) / 46 + B, B, stone);
    px(wx - cam, y + B, (sTo - sFrom) / 46 + B, Math.max(1, B * 0.5), stoneDark);
    if (k % 9 === 4 && butteH(wx) < bandAt(wx) * 0.34) {
      px(wx - cam, y - B * 5, Math.max(1, B * 0.7), B * 5, zincDark);
      px(wx - cam - B * 0.6, y - B * 6.4, B * 2, B * 1.4, lit);
      lampCount += 1;
      if (lampCount === 2) hits.push({ id: 'mymemoires', x: wx - cam - B, y: y - B * 6.4, w: B * 3, h: B * 6.4 });
    }
  }

  // ── La vigne du Clos Montmartre, sur le versant ─────────────
  // Le seul segment de la traversée qui n'avait aucun repère : entre le Moulin
  // et la basilique, la pente était nue.
  const vineFrom = TOTAL * 0.755;
  const vineTo = TOTAL * 0.875;
  if (vineTo > cam - 40 && vineFrom < cam + W + 40) {
    // La parcelle n'apparaît qu'après la tombée de la nuit : ses tons de nuit
    // doivent se détacher du vert de la butte ([22,30,27]), pas s'y fondre.
    const vine = dusk ? tone([88, 112, 66], [80, 96, 64], [26, 36, 30]) : 'rgb(88,112,66)';
    const vineTop = dusk ? tone([128, 152, 90], [114, 128, 86], [52, 68, 48]) : 'rgb(128,152,90)';
    const stake = dusk ? tone([206, 194, 166], [202, 178, 156], [92, 88, 78]) : 'rgb(206,194,166)';
    const wire = dusk ? tone([168, 158, 134], [158, 142, 124], [58, 56, 52]) : 'rgb(168,158,134)';
    // Le chêne se détache du vert froid de la butte par sa chaleur, pas par sa clarté.
    const wood = dusk ? tone([146, 96, 58], [132, 84, 56], [86, 60, 42]) : 'rgb(146,96,58)';
    const woodTop = dusk ? tone([178, 128, 82], [164, 112, 78], [116, 84, 58]) : 'rgb(178,128,82)';
    const hoop = dusk ? tone([96, 62, 40], [88, 56, 38], [50, 36, 28]) : 'rgb(96,62,40)';
    const step = B * 2.2;
    // Du rang le plus haut au plus bas : les rangs proches recouvrent les lointains.
    for (let row = 0; row < 3; row++) {
      const drop = row * B * 1.3;
      for (let wx = vineFrom; wx <= vineTo; wx += step) {
        const x = wx - cam;
        if (x < -step || x > W + step) continue;
        const base = ground - butteH(wx) + drop;
        px(x, base - B * 1.1, step, Math.max(1, B * 0.22), wire); // fil de palissage
        px(x, base - B * 1.8, Math.max(1, B * 0.45), B * 1.8, stake); // piquet
        // Rien n'est aligné dans une vigne : chaque cep prend sa hauteur.
        const h = B * (0.9 + rand(wx * 0.31 + row * 7) * 0.7);
        px(x - B * 0.45, base - B * 1.3 - h, B * 1.4, h, vine);
        px(x - B * 0.45, base - B * 1.3 - h, B * 1.4, Math.max(1, B * 0.3), vineTop);
      }
      // Tonneaux — dessinés rang par rang, donc masqués par les rangs plus proches.
      BARRELS.forEach((brl) => {
        if (brl.row !== row) return;
        const bwx = vineFrom + brl.f * (vineTo - vineFrom);
        const bx = bwx - cam;
        if (bx < -B * 4 || bx > W + B * 4) return;
        const bw = B * 1.2 * brl.size;
        const bh = B * 1.5 * brl.size;
        const foot = ground - butteH(bwx) + drop;
        const topY = foot - bh;
        px(bx - B * 0.15, foot, bw + B * 0.3, Math.max(1, B * 0.2), 'rgba(0,0,0,.22)'); // ombre au sol
        px(bx, topY, bw, bh, wood);
        px(bx, topY, bw, Math.max(1, B * 0.26), woodTop); // fond du tonneau, vu de dessus
        px(bx, topY + bh * 0.3, bw, Math.max(1, B * 0.22), hoop); // cercle haut
        px(bx, topY + bh * 0.64, bw, Math.max(1, B * 0.22), hoop); // cercle bas
      });
    }
    // Muret du clos, en pied de parcelle.
    for (let wx = vineFrom; wx <= vineTo; wx += B) {
      const x = wx - cam;
      if (x < -B || x > W + B) continue;
      const y = ground - butteH(wx) + B * 3.4;
      px(x, y, B, B * 0.8, stone);
      px(x, y, B, Math.max(1, B * 0.28), stoneDark);
    }
  }

  // ── Moulin de la Galette ────────────────────────────────────
  const mwx = TOTAL * 0.7;
  if (mwx > cam - 80 && mwx < cam + W + 40) {
    const mx = mwx - cam;
    const my = ground - butteH(mwx);
    const u = Math.max(2.2, (bandAt(mwx) - butteH(mwx)) / 7);
    const red = css(lerpRgb(lerpRgb([196, 69, 43], [178, 58, 36], dayP), [96, 26, 20], night));
    const redDark = css(lerpRgb(lerpRgb([150, 48, 30], [138, 40, 26], dayP), [62, 16, 12], night));
    const neon = 'rgba(255,86,58,' + (0.35 + night * 0.6).toFixed(2) + ')';
    const bulb = 'rgba(255,226,158,' + (0.4 + night * 0.6).toFixed(2) + ')';

    px(mx, my - u * 11, u * 6, u * 11, red);
    px(mx, my - u * 11, Math.max(1, u * 1.4), u * 11, redDark);
    px(mx - u * 0.6, my - u * 12.8, u * 7.2, u * 1.8, redDark);

    const hubX = mx + u * 3;
    const hubY = my - u * 13.4;
    const spin = (clock / 26000) * Math.PI * 2; // un tour en 26 s
    for (let a = 0; a < 4; a++) {
      const ang = (a * Math.PI) / 2 + spin;
      for (let t = 1; t <= 9; t++) {
        px(
          hubX + Math.cos(ang) * t * u,
          hubY + Math.sin(ang) * t * u,
          Math.max(1, u * 1.2),
          Math.max(1, u * 1.2),
          t > 6 ? redDark : red,
        );
      }
    }
    px(hubX - u * 0.9, hubY - u * 0.9, u * 1.8, u * 1.8, redDark);

    // Le moyeu : centre géométrique du rotor, donc indépendant de `spin` — la
    // zone ne tourne pas avec les pales, elle reste sur l'axe.
    hits.push({ id: 'moulin', x: hubX - u * 2.5, y: hubY - u * 2.5, w: u * 5, h: u * 5 });

    // Les lumières s'allument quand le soleil est couché.
    if (night > 0.02) {
      ctx.globalAlpha = night;
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2 + spin;
        for (let t = 2; t <= 9; t += 2) {
          px(hubX + Math.cos(ang) * t * u, hubY + Math.sin(ang) * t * u, Math.max(1, u * 1.2), Math.max(1, u * 1.2), bulb);
        }
      }
      px(hubX - u * 0.9, hubY - u * 0.9, u * 1.8, u * 1.8, bulb);
      px(mx + u * 0.8, my - u * 8.4, u * 4.4, u * 1.6, neon); // enseigne
      for (let wy = 0; wy < 3; wy++) {
        px(mx + u * 2.2, my - u * 6 + wy * u * 2, Math.max(1, u * 1.6), u * 1.2, bulb); // fenêtres du fût
      }
      px(mx - u * 0.6, my - u * 12.8, u * 7.2, Math.max(1, u * 0.6), neon); // liseré de toiture
      ctx.globalAlpha = 1;
    }
  }

  // ── Sacré-Cœur en crête ─────────────────────────────────────
  const scx = TOTAL * SACRE_COEUR_FR;
  if (scx > cam - 200 && scx < cam + W + 80) {
    const bx = scx - cam;
    const by = ground - butteH(scx);
    const u = Math.max(1.1, (bandAt(scx) - butteH(scx)) / 50);

    // Coupole en ogive : large à la base, resserrée en pointe.
    const dome = (cx: number, baseY: number, w: number, h: number, faceCol: string, shadeCol: string) => {
      const rows = Math.max(5, Math.round(h / u));
      const rh = h / rows;
      for (let r = 0; r < rows; r++) {
        const k = (r + 0.5) / rows;
        const ww = Math.max(u, w * Math.pow(1 - Math.pow(k, 2.1), 0.6));
        const y = baseY - (r + 1) * rh;
        px(cx - ww / 2, y, ww, rh + 1, faceCol);
        px(cx - ww / 2, y, Math.max(1, u * 0.9), rh + 1, shadeCol);
        if (r % 3 === 2) px(cx - ww / 2, y, ww, Math.max(1, u * 0.3), shadeCol); // nervures
      }
    };

    // Baies en plein cintre.
    const arches = (x0: number, y0: number, w: number, h: number, n: number, gap: number, col: string) => {
      const aw = (w - gap * (n - 1)) / n;
      for (let a = 0; a < n; a++) {
        const ax = x0 + a * (aw + gap);
        px(ax, y0 - h + aw * 0.5, aw, h - aw * 0.5, col);
        for (let r = 0; r < 3; r++) {
          const ins = (aw / 2) * (1 - Math.sqrt(Math.max(0, 1 - Math.pow((r + 0.6) / 3, 2))));
          px(ax + ins, y0 - h + aw * 0.5 - (r + 1) * (aw * 0.17), Math.max(1, aw - ins * 2), aw * 0.17 + 1, col);
        }
      }
    };

    // Trois plans : le fond glisse moins vite et se tient dans le ton reculé.
    const pd = (d: number) => bx + (bx - W / 2) * d;
    const xb = pd(-0.05);
    const xm = pd(0);
    const xf = pd(0.055);

    // PLAN ARRIÈRE — campanile, tambour, grand dôme.
    const campTop = by - u * 30;
    const campBase = Math.max(by, ground - butteH(scx + u * 20)) + u * 2;
    px(xb + u * 17.6, campTop, u * 5.6, campBase - campTop, ivoryShade);
    px(xb + u * 17.6, campTop, Math.max(1, u), campBase - campTop, ivoryDeep);
    arches(xb + u * 18.8, by - u * 22, u * 3.2, u * 5, 1, 0, ivoryDeep);
    arches(xb + u * 18.8, by - u * 13.5, u * 3.2, u * 4, 1, 0, ivoryDeep);
    px(xb + u * 16.6, by - u * 31.2, u * 7.6, Math.max(1, u * 1.2), ivoryDeep);
    dome(xb + u * 20.4, by - u * 31.2, u * 6, u * 7, ivoryShade, ivoryDeep);

    px(xb - u * 8, by - u * 22, u * 16, u * 22, ivoryShade); // tambour ajouré, fût compris
    px(xb - u * 8, by - u * 22, u * 16, Math.max(1, u * 0.9), ivoryDeep);
    arches(xb - u * 7, by - u * 15.8, u * 14, u * 5, 5, u * 0.9, ivoryDeep);
    px(xb - u * 8.8, by - u * 23, u * 17.6, Math.max(1, u * 1.1), ivoryDeep);
    dome(xb, by - u * 23, u * 16, u * 15, ivoryShade, ivoryDeep); // grand dôme
    px(xb - u * 2, by - u * 41, u * 4, u * 3, ivoryShade); // lanterne
    px(xb - u * 2, by - u * 41, Math.max(1, u * 0.8), u * 3, ivoryDeep);
    px(xb - u * 2.6, by - u * 41.6, u * 5.2, Math.max(1, u * 0.9), ivoryDeep);
    dome(xb, by - u * 41.6, u * 3.4, u * 3.4, ivoryShade, ivoryDeep);
    px(xb - Math.max(1, u * 0.4), by - u * 48.2, Math.max(1, u * 0.8), u * 3.2, ivoryDeep); // croix
    px(xb - u * 1.5, by - u * 47.3, u * 3, Math.max(1, u * 0.8), ivoryDeep);

    // PLAN MÉDIAN — massif central et clochetons d'angle.
    // Chaque plan descend jusqu'au terrain : la parallaxe les écarte latéralement,
    // et un bloc qui s'arrête à mi-hauteur laisse voir le vide sous ses pieds dès
    // que la basilique n'est plus centrée à l'écran.
    px(xm - u * 11, by - u * 15, u * 22, u * 15, ivory);
    px(xm - u * 11, by - u * 15, u * 22, Math.max(1, u * 0.8), ivoryShade);
    arches(xm - u * 9, by - u * 8.8, u * 18, u * 5, 3, u * 2.2, ivoryDeep);
    [-1, 1].forEach((s) => {
      px(xm + s * u * 12.6 - u * 2.5, by - u * 20, u * 5, u * 20, ivory);
      px(xm + s * u * 12.6 - u * 2.5, by - u * 20, Math.max(1, u * 0.9), u * 20, ivoryShade);
      arches(xm + s * u * 12.6 - u * 1.6, by - u * 12.5, u * 3.2, u * 4.2, 1, 0, ivoryDeep);
      dome(xm + s * u * 12.6, by - u * 20, u * 5.6, u * 6.5, ivory, ivoryShade);
      px(xm + s * u * 12.6 - Math.max(1, u * 0.35), by - u * 28, Math.max(1, u * 0.7), u * 1.6, ivoryShade);
    });

    // PLAN AVANT — soubassement à trois portails.
    px(xf - u * 16, by - u * 8.4, u * 32, u * 8.4, ivory);
    px(xf - u * 16, by - u * 9.6, u * 32, Math.max(1, u * 1.2), ivoryShade);
    arches(xf - u * 13.5, by, u * 27, u * 6.4, 3, u * 3, ivoryDeep);
    // Le portail central : `arches` répartit trois baies de 7 u espacées de 3 u
    // depuis `xf - 13.5 u`, donc la deuxième commence 10 u plus loin.
    hits.push({ id: 'github', x: xf - u * 3.5, y: by - u * 6.4, w: u * 7, h: u * 6.4 });
  }

  // ── Le lama du Studio Lamarck, dans la plaine après la redescente ──
  const lwx = TOTAL * 0.972;
  const sprites = lwx > cam - 80 && lwx < cam + W + 20 ? lamaSprites() : null;
  if (sprites) {
    const [flat, litSprite] = sprites;
    const size = Math.max(5, bandAt(lwx) * 0.11);
    const lx = Math.round(lwx - cam);
    const ly = Math.round(ground - butteH(lwx) - size);
    const gy = ly + size;

    // Lampadaire : géométrie plancher pour rester lisible à petite échelle.
    const ls = Math.max(size, B * 3);
    const postX = Math.round(lx - ls * 1.25);
    const lampTop = gy - ls * 2.4;
    const postW = Math.max(2, ls * 0.14);
    if (night > 0.02) {
      const cone = ctx.createLinearGradient(0, lampTop, 0, gy); // cône de lumière
      cone.addColorStop(0, 'rgba(255,224,158,' + (0.85 * night).toFixed(2) + ')');
      cone.addColorStop(0.5, 'rgba(255,224,158,' + (0.34 * night).toFixed(2) + ')');
      cone.addColorStop(1, 'rgba(255,224,158,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(postX + ls * 0.1, lampTop + ls * 0.14);
      ctx.lineTo(postX + ls * 3, gy);
      ctx.lineTo(postX - ls * 0.6, gy);
      ctx.closePath();
      ctx.fill();
    }
    const postCol = night > 0.02 ? 'rgb(116,110,98)' : zincDark;
    px(postX, lampTop, postW, gy - lampTop, postCol); // fût
    px(postX + postW - 1, lampTop, 1, gy - lampTop, night > 0.02 ? 'rgb(196,178,140)' : zinc); // arête éclairée
    px(postX - ls * 0.18, lampTop - ls * 0.18, ls * 0.5, Math.max(2, ls * 0.16), postCol); // potence
    px(
      postX - ls * 0.12,
      lampTop,
      Math.max(3, ls * 0.36),
      Math.max(2, ls * 0.22),
      night > 0.02 ? 'rgba(255,232,176,' + (0.55 + night * 0.45).toFixed(2) + ')' : zinc,
    ); // lanterne

    hits.push({ id: 'lama', x: lx, y: ly, w: size, h: size });
    ctx.drawImage(flat, lx, ly, Math.round(size), Math.round(size));
    if (night > 0.02) {
      ctx.globalAlpha = night; // silhouette éclairée côté lampadaire
      ctx.drawImage(litSprite, lx, ly, Math.round(size), Math.round(size));
      ctx.globalAlpha = 1;
    }
    px(lx - size * 0.15, gy, size * 1.3, Math.max(1, B * 0.5), 'rgba(0,0,0,.14)');
  }

  // ── Toits haussmanniens — le début du parcours ──────────────
  const rEnd = TOTAL * 0.42;
  for (let i = 0; i < 90; i++) {
    const bx = i * (W * 0.062) + rand(i) * W * 0.018;
    if (bx > rEnd || bx < cam - 90 || bx > cam + W + 30) continue;
    const bw = B * (8 + Math.round(rand(i + 3) * 6));
    const fade = Math.min(1, (rEnd - bx) / (W * 0.5));
    const bh = Math.max(B * 5, bandAt(bx) - B * 5) * (0.5 + rand(i + 9) * 0.4) * (0.62 + 0.38 * fade);
    const top = ground - bh;
    px(bx - cam, top, bw, ground - top + 2, i % 3 === 0 ? stoneDark : stone);
    // Toit en zinc (mansarde).
    px(bx - cam - B, top - B * 2, bw + B * 2, B * 2, zinc);
    px(bx - cam, top - B * 3.2, bw, B * 1.4, zincDark);
    // Cheminées.
    for (let ch = 0; ch < 2 + Math.round(rand(i + 17) * 2); ch++) {
      const cx = bx + B * 1.5 + ch * (bw / 3.2) + rand(i + ch) * B;
      px(cx - cam, top - B * 5.6, Math.max(1, B * 1.1), B * 2.6, i % 2 ? 'rgb(176,124,104)' : stoneDark);
      px(cx - cam - B * 0.3, top - B * 6.2, B * 1.7, Math.max(1, B * 0.8), zincDark);
      // Puff puff : seule une cheminée sur dix tire.
      const seed = rand(i * 13 + ch * 7 + 3);
      if (seed > 0.9) {
        const period = 2400 + seed * 2600;
        for (let s = 0; s < 3; s++) {
          const k = (clock / period + s / 3 + seed) % 1;
          const puff = Math.max(2, B * (1.4 + k * 1.8));
          const drift = (seed > 0.85 ? -1 : 1) * k * k * B * 3.2;
          ctx.globalAlpha = 0.72 * (1 - k);
          px(cx - cam - B * 0.2 + drift - puff / 2, top - B * 6.6 - k * B * 8, puff, puff, 'rgb(150,148,142)');
          ctx.globalAlpha = 1;
        }
      }
    }
    // Fenêtres + lucarne.
    for (let wy = top + B * 2; wy < ground - B * 1.5; wy += B * 3) {
      for (let wxx = bx + B * 1.5; wxx < bx + bw - B * 1.5; wxx += B * 2.6) {
        px(wxx - cam, wy, Math.max(1, B * 1.1), B * 1.6, rand(wxx * 2.3 + wy) > 0.42 ? lit : 'rgba(96,88,74,.45)');
      }
    }
    px(bx - cam + bw / 2 - B, top - B * 1.6, B * 2, Math.max(1, B * 1.2), lit);
    // Devanture.
    if (i % 4 === 1) px(bx - cam + B, ground - B * 2.4, bw * 0.5, Math.max(1, B * 1.1), 'rgba(' + accent.join(',') + ',.75)');
  }

  // ── Métro aérien — la traversée ─────────────────────────────
  const vStart = TOTAL * 0.3;
  const vEnd = TOTAL * 0.6;
  if (cam < vEnd + 60 && cam + W > vStart - 60) {
    // Toute la structure (tablier, jambes, bouches, rame) se dessine sur `b` :
    // à l'échelle du panorama, le pas global `B` la faisait déborder sur la bande de texte.
    const b = B * VIADUCT_SCALE;
    const deck = ground - bandAt(TOTAL * 0.45) * 0.62;
    const span = b * 26;
    // Le viaduc s'enfonce de 5 b dans chaque bouche et s'arrête là. Tablier, jambes
    // et treillis partagent cette limite : la dernière travée démarrant avant `vEnd`,
    // sa jambe droite (`wx + span`) atterrissait jusqu'à une portée au-delà de la
    // maçonnerie. Le débord dépend du reste de `(vEnd - vStart) / span`, donc du
    // rapport d'écran — invisible sur certaines largeurs, franc sur d'autres.
    const vFrom = vStart - b * 5;
    const vTo = vEnd + b * 5;
    const legTop = deck + b;
    const legH = ground - legTop;
    const legW = Math.max(1, b * 1.4);
    const strut = Math.max(1, b * 0.6);
    for (let wx = vStart; wx <= vEnd; wx += span) {
      if (wx < cam - span || wx > cam + W + span) continue;
      [wx, wx + span - b * 1.4].forEach((lx) => {
        if (lx < vFrom || lx > vTo) return;
        px(lx - cam, legTop, legW, legH, iron);
      });
      for (let t = 0; t <= 14; t++) {
        const k = t / 14;
        const y = legTop + k * legH;
        const xDown = wx + k * span;
        const xUp = wx + span - k * span;
        if (xDown >= vFrom && xDown <= vTo) px(xDown - cam, y, strut, strut, blue2Soft);
        if (xUp >= vFrom && xUp <= vTo) px(xUp - cam, y, strut, strut, blue2Soft);
      }
    }

    // Bouches de tunnel : le viaduc entre et sort de la masse maçonnée.
    const portalW = b * 12;
    const openW = b * 7;
    const arch = [2.9, 1.7, 0.9, 0.4, 0.1];
    const topM = Math.round(deck - b * 9.5);
    const oyTop = Math.round(deck - b * 6.2);
    const oyBot = deck + b * 2.4;
    const rowH = Math.max(1, b * 0.75);
    const faceX = (face: number, dir: number) => Math.round((dir > 0 ? face - portalW : face) - cam);

    // Fond : le vide de la bouche, derrière la rame.
    const portalBack = (face: number, dir: number) => {
      const sx = faceX(face, dir);
      if (sx > W || sx + portalW < 0) return;
      px(dir > 0 ? sx + portalW - openW : sx, oyTop, openW, oyBot - oyTop, 'rgb(15,14,12)');
    };
    // Devant : la maçonnerie, qui masque la rame engagée.
    const portalFront = (face: number, dir: number) => {
      const sx = faceX(face, dir);
      if (sx > W || sx + portalW < 0) return;
      const outX = dir > 0 ? sx : sx + openW;
      const outW = portalW - openW;
      px(sx, topM, portalW, oyTop - topM, stone);
      px(sx, oyBot, portalW, ground - oyBot + b * 2, stone);
      px(outX, topM, outW, ground - topM + b * 2, stone);
      for (let sy = topM + b * 2.4; sy < ground; sy += b * 2.4) {
        px(outX, sy, outW, Math.max(1, b * 0.4), 'rgba(0,0,0,.13)');
        if (sy > oyBot) px(sx, sy, portalW, Math.max(1, b * 0.4), 'rgba(0,0,0,.13)');
      }
      arch.forEach((ins, s) => {
        const w = Math.max(1, ins * b);
        const y = oyTop + s * rowH;
        const ax = dir > 0 ? sx + portalW - openW : sx + openW - w;
        px(ax, y, w, rowH + 1, stone); // voussoirs
        px(ax, y, w, Math.max(1, b * 0.35), stoneDark);
      });
      px(sx - b, topM, portalW + b * 2, Math.max(1, b * 1.2), stoneDark); // corniche
      px(sx - b, topM + b * 1.2, portalW + b * 2, Math.max(1, b * 0.5), 'rgba(0,0,0,.2)');
      px(sx + b * 1.4, topM - b * 1.6, b * 4, b * 1.6, blue2Soft); // plaque ligne 2
    };

    portalBack(vStart, 1);
    portalBack(vEnd, -1);

    for (let x = 0; x < W; x += b) {
      const wx = cam + x;
      if (wx < vFrom || wx > vTo) continue;
      px(x, deck, b, b * 1.2, iron);
      px(x, deck + b * 1.2, b, Math.max(1, b * 0.6), 'rgba(0,0,0,.14)');
      if (Math.round(wx / b) % 2 === 0 && wx > vStart && wx < vEnd) {
        px(x, deck - b * 1.6, Math.max(1, b * 0.6), b * 1.6, 'rgba(0,100,173,.55)');
      }
    }

    // Rame : circule de droite à gauche, indépendamment du scroll — une traversée toutes les 17 s.
    const pitch = b * 12;
    const rakeW = pitch * 3;
    const trav = vEnd - vStart + rakeW + openW * 1.7;
    const tx = vEnd + openW * 0.85 - ((clock / 17000) % 1) * trav;
    for (let car = 0; car < 3; car++) {
      const cx0 = tx + car * pitch;
      if (cx0 < cam - b * 40 || cx0 > cam + W + b * 20) continue;
      // Chaque voiture s'efface pour son propre compte en s'engageant sous la voûte.
      const mid = cx0 + b * 5.5;
      const fade = openW * 0.85;
      const a = Math.min(clamp01((mid - (vStart - fade)) / fade), clamp01((vEnd + fade - mid) / fade));
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      px(cx0 - cam, deck - b * 3.6, b * 11, b * 3.6, stone);
      px(cx0 - cam, deck - b * 4.3, b * 11, Math.max(1, b * 0.8), iron);
      for (let wq = 0; wq < 4; wq++) {
        px(cx0 - cam + b * 1.2 + wq * b * 2.5, deck - b * 2.9, Math.max(1, b * 1.6), b * 1.4, lit);
      }
      ctx.globalAlpha = 1;
    }

    // Pénombre : la rame s'éteint progressivement en s'engageant sous la voûte.
    const gloom = (lightEdge: number, deepEdge: number) => {
      const x0 = Math.round(lightEdge - cam);
      const x1 = Math.round(deepEdge - cam);
      if (Math.max(x0, x1) < 0 || Math.min(x0, x1) > W) return;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(15,14,12,0)');
      g.addColorStop(0.32, 'rgba(15,14,12,.42)');
      g.addColorStop(0.62, 'rgba(15,14,12,.82)');
      g.addColorStop(1, 'rgb(15,14,12)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), oyTop, Math.abs(x1 - x0), oyBot - oyTop);
    };
    gloom(vStart + b * 5, vStart - openW);
    gloom(vEnd - b * 5, vEnd + openW);
    portalFront(vStart, 1);
    portalFront(vEnd, -1);
  }

  // ── Ligne 12 en coupe, au premier plan ──────────────────────
  const t = B * TUNNEL_SCALE;
  px(0, ground, W, Math.max(1, B * 1.1), dusk ? tone([150, 142, 124], [138, 124, 114], [38, 36, 40]) : 'rgb(150,142,124)'); // niveau rue

  // La pile se construit depuis le bas de l'écran, pas depuis la rue : c'est la
  // rame qui fixe l'échelle, et la voûte se déduit d'elle. La terre occupe ce qui
  // reste entre la chaussée et la voûte — le tunnel n'affleure pas le trottoir.
  const tileW = Math.max(2, Math.round(t));
  const tileH = Math.max(2, Math.round(t * 0.7));
  const joint = Math.max(1, Math.round(t * 0.3));
  const bandH = Math.max(2, Math.round(t * 0.8));
  const railY = H - Math.max(2, t * 1.5);
  const carH = t * 5;
  const carTop = railY - carH;
  const tilesTop = joint;
  const tilesBottom = tilesTop + 2 * (tileH + joint);
  const bandOffset = tilesBottom + joint;
  const tTop = carTop - (bandOffset + bandH + joint);

  const earth = dusk ? tone([116, 98, 78], [104, 86, 72], [32, 28, 25]) : 'rgb(116,98,78)';
  const earthDark = dusk ? tone([92, 76, 60], [82, 68, 56], [24, 21, 19]) : 'rgb(92,76,60)';
  const earthTop = ground + Math.max(1, B * 1.1);
  px(0, earthTop, W, tTop - earthTop, earth);
  px(0, tTop - Math.max(1, t * 0.4), W, Math.max(1, t * 0.4), earthDark); // contact avec la voûte
  px(0, tTop, W, H - tTop, 'rgb(22,21,18)'); // vide du tunnel

  // Voûte carrelée — carreaux biseautés blancs, en assises à joints croisés.
  // Volontairement plus petits et plus froids que les fenêtres de la rame : à taille
  // et teinte égales, les deux se lisaient comme une double rangée de fenêtres.
  // Dimensions arrondies à l'entier dès le calcul : avec un pas fractionnaire, px()
  // arrondit chaque carreau séparément et les joints deviennent irréguliers.
  const tilePitch = tileW + joint;
  // Ancrage au monde : sans le terme `cam`, la bande restait collée au viewport —
  // le seul élément immobile du panorama, et le plus proche de la caméra.
  const tileOff = (((cam * TUNNEL_PARA) % tilePitch) + tilePitch) % tilePitch;
  for (let c = 0; c < 2; c++) {
    const ty = tTop + tilesTop + c * (tileH + joint);
    const stagger = c % 2 ? Math.round(tilePitch / 2) : 0; // joints croisés
    for (let x = -tilePitch - tileOff + stagger; x < W + tilePitch; x += tilePitch) {
      px(x, ty, tileW, tileH, 'rgba(234,240,243,.95)');
      px(x, ty + tileH - joint, tileW, joint, 'rgba(118,132,142,.5)'); // biseau du bas
    }
  }
  const bandY = tTop + bandOffset;
  px(0, bandY, W, bandH, green12); // bandeau ligne 12

  // Rails + ballast.
  px(0, railY + Math.max(1, t * 0.7), W, H - railY, 'rgb(58,54,47)');
  const sleeperPitch = Math.max(3, Math.round(t * 3));
  const sleeperOff = (((cam * TUNNEL_PARA) % sleeperPitch) + sleeperPitch) % sleeperPitch;
  for (let x = -sleeperPitch - sleeperOff; x < W + sleeperPitch; x += sleeperPitch) {
    px(x, railY + Math.max(1, t * 0.5), Math.max(2, t * 1.6), Math.max(1, t * 0.4), 'rgba(120,112,96,.8)');
  }
  px(0, railY, W, Math.max(1, t * 0.4), 'rgba(176,172,162,.9)');
  px(0, railY + Math.max(1, t * 0.9), W, Math.max(1, t * 0.4), 'rgba(150,146,136,.75)');

  // Rame ligne 12 : file plus vite que le décor.
  const carW = t * 13;
  const carGap = t * 1.4;
  const rakeW12 = (carW + carGap) * 4;
  const PARA = 1.7;
  const isMobile = opts.viewportWidth < 620; // largeur réelle du viewport, pas les unités d'art
  const loopW = W * (isMobile ? 4.4 : 2.2); // mobile : deux fois moins de passages
  const rakeX = ((((0.2 * TOTAL - cam * PARA) % loopW) + loopW) % loopW) - rakeW12;
  for (let car = 0; car < 4; car++) {
    const cx0 = rakeX + car * (carW + carGap);
    if (cx0 > W || cx0 + carW < 0) continue;
    px(cx0, carTop, carW, railY - carTop, green12);
    px(cx0, carTop, carW, Math.max(1, t * 0.6), 'rgba(255,255,255,.3)');
    px(cx0, railY - Math.max(1, t * 0.7), carW, Math.max(1, t * 0.7), 'rgba(0,0,0,.35)');
    for (let wq = 0; wq < 4; wq++) {
      px(cx0 + t * 1.6 + wq * t * 2.8, carTop + t * 1.1, t * 1.9, t * 1.6, 'rgba(250,230,186,.92)');
    }
    px(cx0 + carW - Math.max(1, t * 0.5), carTop, Math.max(1, t * 0.5), railY - carTop, 'rgba(0,0,0,.3)');
  }

  // Quais de station, deux fois sur le parcours.
  [0.3, 0.72].forEach((fr) => {
    const sx = fr * TOTAL - cam * TUNNEL_PARA;
    if (sx < -W || sx > W * 1.2) return;
    px(sx, railY - t * 2.6, W * 0.34, t * 2.6, 'rgba(214,206,188,.95)');
    px(sx, railY - t * 2.6, W * 0.34, Math.max(1, t * 0.5), 'rgba(240,237,228,.95)');
    // Plaque de station, à cheval sur le bandeau de ligne.
    px(sx + W * 0.06, bandY - joint, t * 9, bandH + joint * 2, green12);
    px(sx + W * 0.06 + t, bandY, t * 7, Math.max(1, t * 0.5), 'rgba(255,255,255,.85)');
  });

  return { hits, sun };
}

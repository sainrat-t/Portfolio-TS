# Portfolio — Thibaut Sainrat

Portfolio personnel en une page. Le scroll vertical pilote **deux choses en parallèle** : un carrousel horizontal de 7 panneaux de contenu, et un panorama pixel-art dessiné au canvas qui traverse le 18e arrondissement de gauche à droite — toits haussmanniens, Tour Eiffel à l'horizon, viaduc de la ligne 2, la Butte, Moulin de la Galette, vigne du Clos Montmartre et ses tonneaux, Sacré-Cœur, et le lama du Studio Lamarck dans la plaine. La ligne 12 défile en coupe au premier plan.

Le soleil se couche pendant la traversée : au niveau du Moulin le ciel bascule en bleu nuit, les monuments s'allument et la typographie passe en tons clairs. La lune traverse le ciel d'est en ouest sur toute la fin du parcours et vient se poser à droite de la basilique, où une lueur d'aube monte de l'horizon pendant que les nuages se dissipent.

En production : [thibautsainrat.fr](https://thibautsainrat.fr)

---

## Le principe

Une seule valeur gouverne tout : **`progress`**, entre 0 et 1, dérivée de la position du scroller dans le viewport.

```
progress = -scroller.getBoundingClientRect().top / (scroller.offsetHeight - sticky.offsetHeight)
```

Elle pilote trois choses, toutes mises à jour impérativement dans `tick()` ([`src/App.tsx`](src/App.tsx)) — **aucun état React, donc aucun rendu pendant le scroll** :

| Ce qui bouge | Comment |
|---|---|
| Le carrousel | un seul `translate3d` sur le track ; pas de scroll horizontal natif |
| Le fondu des panneaux | opacité `1 - distance × 1.45`, plus une translation verticale de 22 px |
| Le panorama | la caméra avance de `progress × (TOTAL - W)`, et le cycle jour/nuit s'applique |

Une **seconde horloge, indépendante du scroll** (`clock`, en ms) anime ce qui doit bouger même à l'arrêt : la rame de la ligne 2 (une traversée toutes les 17 s), les pales du Moulin (un tour en 26 s), la fumée des cheminées et le scintillement des étoiles. Elle tourne dans une boucle `requestAnimationFrame` bridée à 30 fps, désactivée dès que le sticky sort du viewport.

```
<div.om-scroller>                 hauteur : 7 × viewport (posée en px par measure())
  └── <div.om-sticky>             position:sticky; top:0; overflow:hidden
        ├── <canvas.om-canvas>    le panorama
        ├── <header.om-header>    z-30, fixe, hors carrousel
        └── <div.om-track>        z-20, flex, un seul transform
              └── 7 × <section.om-panel>
```

---

## Stack

| | |
|---|---|
| Build | Vite 6 |
| UI | React 19, TypeScript 5.8 |
| Panorama | Canvas 2D, sans librairie |
| Styles | CSS simple, variables sur `:root` — pas de framework |
| Polices | Newsreader (titres) + JetBrains Mono (interface), Google Fonts |

Aucune image : le panorama entier est peint au canvas, et la silhouette du lama est un `Path2D` rasterisé une fois dans un sprite 30×30.

---

## Démarrage

**Prérequis** : Node.js 18+ (développé sous 22).

```bash
npm install
```

```bash
npm run dev
```

Le serveur écoute sur **http://localhost:3000** (`server.port` dans [`vite.config.ts`](vite.config.ts), exposé sur `0.0.0.0` pour tester depuis un mobile du même réseau).

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement avec HMR |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le `dist/` construit, pour vérifier avant déploiement |

---

## Structure

```
public/
  icon.svg                   favicon, monogramme « TS »
  voxtral.svg                icône d'un easter egg — servie en local, pas en lien externe
  Avatar_new.jpeg            portrait illustré, affiché par un easter egg
  avatar.png, avatar_neo.png ← utilisés uniquement par archive/
src/
  index.tsx                  point d'entrée React
  App.tsx                    ossature, scroll, navigation, boucle de rendu
  styles.css                 tokens, ossature, typographie, mobile
  components/
    panels.tsx               les 7 panneaux, un composant par panneau
  data/
    content.ts               ← tout le contenu éditorial
    eggs.ts                  ← easter eggs + compteur de session
  components/
    MusicBattleDemo.tsx      module interactif d'un easter egg
    MyMemoiresRecorder.tsx   idem — l'enregistreur, en déclinaison pixel
  components/
    EasterEgg.tsx            fenêtre façon Windows 95, relue dans la DA
  panorama/
    draw.ts                  le panorama, de haut en bas dans l'ordre de peinture
    utils.ts                 bruit déterministe, mélange de couleurs, smoothstep
archive/                     version précédente (modes Strategist / Builder), hors build
index.html
vite.config.ts
```

---

## Modifier le contenu

Tout le contenu éditorial est dans [`src/data/content.ts`](src/data/content.ts) : `EXPERIENCES`, `PROJECTS`, `LAB`, `CONTACT`. Les titres et accroches des panneaux sont dans [`src/components/panels.tsx`](src/components/panels.tsx), au plus près de leur mise en forme.

| À modifier | Où |
|---|---|
| Parcours, projets, laboratoire, contact | [`src/data/content.ts`](src/data/content.ts) |
| Titres, accroches, les trois leviers | [`src/components/panels.tsx`](src/components/panels.tsx) |
| Couleurs, espacements, échelle typographique | [`src/styles.css`](src/styles.css) |
| Décor, monuments, cycle jour/nuit | [`src/panorama/draw.ts`](src/panorama/draw.ts) |

### Conventions à connaître

- **L'ordre du tableau `EXPERIENCES` est l'ordre d'affichage.** Il est maintenu à la main, en chronologie inverse. Rien ne trie.
- **`current: true` accentue la période en rouge** dans la timeline. C'est un champ explicite, pas une déduction sur le texte de `period`.
- **`status: 'Archivé'`** bascule la pastille d'un projet du labo vers le gris (`--archived`). Toute autre valeur prend l'accent.
- **Ajouter un 8e panneau demande deux modifications** : le composant dans `panels.tsx` **et** la constante `PANELS` de [`src/panorama/draw.ts`](src/panorama/draw.ts) — elle pilote à la fois la hauteur du scroller, la course du track et la largeur du monde (`TOTAL = W × PANELS`). Les positions des monuments sont exprimées en fraction de `TOTAL`, donc elles suivent ; les repères de navigation de `NAV` dans `App.tsx` sont à revoir.

---

## Easter eggs

Certains éléments du décor ouvrent une petite fenêtre. **Rien ne les signale** : pas de curseur `pointer`, pas d'effet au survol, pas de marqueur — c'est le parti pris, et il se tient à condition de ne pas l'entamer par confort.

Le décor étant peint dans un `<canvas>`, il n'y a rien à cliquer. Le mécanisme est donc : **`drawPanorama()` renvoie les boîtes des éléments qu'elle vient de dessiner**, en unités d'art, et `App` positionne un `<div>` transparent sur chacune à chaque peinture. Les coordonnées viennent du dessin lui-même, jamais d'une copie — elles ne peuvent pas dériver du décor.

Le calque des zones est en `pointer-events: none` et seules les boîtes interceptent les clics : sans ça il masquerait les liens des panneaux, qui sont en dessous (`z-20`).

**Ajouter un egg** demande deux moitiés indépendantes : une entrée dans `EGGS` ([`src/data/eggs.ts`](src/data/eggs.ts)) et un `hits.push({ id, … })` dans le dessin de l'élément. Un egg sans boîte est inerte, une boîte sans egg n'intercepte rien — on peut donc préparer l'un sans l'autre.

Un egg peut aussi être déclenché par **du texte de la page** plutôt que par le décor : le champ `textTrigger` désigne un libellé exact qui, s'il apparaît dans un texte passé par `TextWithEgg` ([`panels.tsx`](src/components/panels.tsx)) — corps du panneau « Qui », descriptions du Laboratoire, descriptions et lignes de stack des cartes projet —, devient cliquable. Préférer le mot le plus stable au libellé complet — « Voxtral » plutôt que « STT Voxtral » — pour que le déclencheur survive à une réécriture. Rien ne l'en distingue — même couleur, pas de soulignement, curseur inchangé. **Si le texte est réécrit et que le libellé ne correspond plus, la phrase s'affiche telle quelle** : le lien se perd, rien ne casse.

L'enregistreur MyMémoires ([`MyMemoiresRecorder.tsx`](src/components/MyMemoiresRecorder.tsx)) est une **cinquième peau** de l'enregistreur du studio B2C, conforme au contrat de peinture du handoff `design_handoff_skins_enregistreur` : un skin repeint l'objet, il ne le réorganise jamais. Les onze cotes sont relevées et exactes — ligne de face 13, bandeau 220 × 74, bobines 74, créneau 44 × 30, compteur 15, châssis 243 × 64, capuchons 150 et 84 de course 8, légendes 8 / interligne 10 / offset 7, bloc de 81. **Ne pas y toucher** : une commande déplacée transforme la récompense en punition. Deux pièges rencontrés — les cotes du châssis sont extérieures (garder `border-box`), et les légendes vivent *sous* le châssis, pas dedans. La disquette de « Sauvegarder » est repeinte, jamais remplacée : c'est une règle explicite du contrat.

Le champ `code` affiche un code de déblocage en pied de fenêtre, copiable d'un clic — `navigator.clipboard` exige un contexte sécurisé et une activation utilisateur, donc un clic programmatique échoue là où un vrai clic passe. Le champ `demo` fait afficher un module interactif sous le texte. **Aucun de ces modules ne demande de permission ni ne capte quoi que ce soit** : l'onde de l'enregistreur MyMémoires est une marche aléatoire, pas un signal micro — un easter egg n'a pas à réclamer l'accès au matériel. Le seul aujourd'hui est celui de Music Battle ([`src/components/MusicBattleDemo.tsx`](src/components/MusicBattleDemo.tsx)), repris de l'ancien portfolio et rhabillé : la puissance du vote se charge tant qu'on bouge la souris dans le cadre et retombe dès qu'on s'arrête — la mécanique *est* l'argument.

Le compteur vit dans `sessionStorage` : il survit à un rechargement d'onglet et repart à zéro dans un nouvel onglet. Les accès sont en `try/catch` — en navigation privée ou cookies bloqués, le compteur dégrade sans casser la page.

La fenêtre a **le chrome pixellisé et le contenu éditorial** : cadre épais dont les coins sont taillés en escalier (`clip-path`), biseau deux tons comme une touche système, croix de fermeture dessinée en blocs de 2px et non avec une glyphe de police — mais titre en Newsreader et corps en mono, comme le reste du site. Le cadre est le **fond** du conteneur révélé par son padding : une bordure classique serait rognée par le `clip-path` et se briserait aux coins. Les variables `--egg-px` et `--egg-frame` règlent le grain ; en dessous d'environ 6px le chrome redevient lisse et cesse d'appartenir à la même matière que le panorama.

Le carrousel s'estompe (`opacity: .16`) pendant qu'une fenêtre est ouverte, ce qui règle la lisibilité par-dessus le texte. La fenêtre **ne se ferme qu'à la demande** — bouton, `Échap`, ou clic à côté : comme elle vit dans le conteneur sticky, elle reste calée sur le viewport pendant que le décor défile derrière, et bascule au passage entre palette jour et nuit.

---

## Le panorama

Tout est dans `drawPanorama()` ([`src/panorama/draw.ts`](src/panorama/draw.ts)), lu de haut en bas dans l'ordre de peinture : ciel, étoiles, soleil, lune, nuages, lavis d'aube, Tour Eiffel, la Butte, escaliers, Moulin, vigne, Sacré-Cœur, lama, toits, viaduc, ligne 12.

Le dessin travaille en **unités d'art**, pas en pixels : `H = artHeight` couvre toute la hauteur du canvas, et tout est exprimé en fraction de `H`. Le niveau de la rue est à `H × GROUND_FR`, l'art ne monte jamais au-dessus de `H × 0.74` pour laisser la bande de texte lisible — à l'exception délibérée du Sacré-Cœur, qui dépasse en crête.

Trois réglages sont exposés dans `PanoramaOptions` :

| Option | Défaut | Effet |
|---|---|---|
| `accent` | `#c4452b` | la couleur d'accent du panorama (devantures, soleil couchant) |
| `artHeight` | `200` | l'échelle des monuments — voir ci-dessous |
| `dusk` | `true` | à `false`, plein jour permanent, cycle désactivé |

> `artHeight` ne change **pas** la taille du pixel (elle suit la hauteur du canvas) mais l'échelle des monuments, dont le facteur `u` est planché. Le prototype de design est à 140 ; à cette valeur le Sacré-Cœur monte jusqu'à mi-écran et **chevauche le titre du panneau Contact**. 200 le repose sur la crête sans rien faire perdre au Moulin. La plage prévue par le design est 140 → 340.

Quelques constantes de composition en tête de fichier, hors `PanoramaOptions` :

| Constante | Rôle |
|---|---|
| `VIADUCT_SCALE` | trame du métro aérien. À `1`, la maçonnerie des bouches de tunnel monte au-dessus de la bande d'art et écrase la ligne de toits |
| `TUNNEL_SCALE` | trame de la ligne 12 en coupe, calée pour que la rame verte fasse la même taille que la rame bleue (`13 t ≈ 11 b` en largeur, `5 t ≈ 4.3 b` en hauteur) |
| `GROUND_FR` | niveau de la rue, en fraction de `H`. **Le partage entre surface et souterrain** : la baisser amincit la couche de terre et rend d'autant de hauteur au décor |
| `EIFFEL_*` | position, parallaxe, courbe de sortie et épaisseur de la Tour Eiffel |
| `MOON_FROM_X` / `MOON_TO_X` | course horizontale de la lune, d'est en ouest. `MOON_TO_X` est calé pour la poser **à droite** de la basilique, qui occupe 0.27 W → 0.42 W à `p = 1` |
| `MOON_BASE_Y` / `MOON_ARC_Y` | l'arc : la lune se lève, culmine au milieu de la nuit, puis redescend à hauteur du dôme |
| `DAWN_AT` / `DAWN_RAMP` / `DAWN_ALPHA` | la lueur d'aube du dernier écran, et la dissipation des nuages |
| `TUNNEL_PARA` | parallaxe de la ligne 12 en coupe. Le tunnel est une structure rigide : carrelage, traverses et quais la partagent, seule la rame file plus vite |

Les positions des monuments sont en fraction de `TOTAL` : toits `0 → 0.42`, viaduc `0.30 → 0.60`, escaliers `0.60 → 0.76`, Moulin `0.70`, vigne `0.755 → 0.875`, Sacré-Cœur `0.905`, lama `0.972`. Le panneau `n` (0-indexé) montre la tranche `n/7 → (n+1)/7`, ce qui permet de viser un panneau précis en plaçant un élément.

La **Tour Eiffel** est le seul élément du panorama qui a de la distance : parallaxe `0.12`, bien plus lente que les nuages, donc elle ne dérive presque pas. Sa trajectoire verticale est un artifice assumé — elle sort du sol, culmine au panneau 02, se renfonce au milieu du panneau 03 — suivant une cloche hyperbolique `1/(1+x²)` plutôt qu'une sinusoïde : elle jaillit, tient son sommet, puis replonge.

**Règle à ne pas casser : son pied reste toujours sous la ligne de toits** (le zinc plafonne vers 161 en unités d'art), sortie comprise. Seul le haut de la tour dépasse. Dès que ses jambes écartées deviennent visibles, elle semble décoller du sol au lieu d'émerger de derrière la ville. C'est aussi pourquoi `EIFFEL_GIRTH` doit rester proche de `1` : la massivité s'obtient en agrandissant la tour (`eiffelH`), pas en l'épaississant — le haut du vrai profil fait environ cinq fois plus haut que large, et le déformer le rend méconnaissable. Elle est peinte **avant tout le décor terrestre**, donc elle sort de derrière la ville et non devant elle, et les rangées dont le `y` retombe sous `ground` ne sont pas tracées.

Le viaduc de la ligne 2 s'enfonce de `5 b` dans chaque bouche de tunnel et **tablier, jambes et treillis partagent cette limite**. La boucle des travées itère `wx <= vEnd` mais trace la jambe droite à `wx + span` : sans clipping, la dernière travée la posait jusqu'à une portée au-delà de la maçonnerie. Le débord dépend du reste de `(vEnd - vStart) / span`, donc du rapport d'écran — invisible sur certaines largeurs, franc sur d'autres.

Les positions des **tonneaux de la vigne** (`BARRELS`) sont les seules du panorama tirées au hasard : `Math.random()` au chargement du module, une fois par chargement de page. Tout le reste — nuages compris — passe par `rand(seed)` et est donc identique à chaque visite. Le tirage est au niveau module et non dans `drawPanorama()`, qui s'exécute ~30 fois par seconde.

La coupe de la ligne 12 se construit **depuis le bas de l'écran**, pas depuis la rue : la rame fixe l'échelle, la voûte se déduit d'elle (`joint + 2 assises + bandeau`), et la terre occupe ce qui reste entre la chaussée et la voûte. Conséquence utile : `GROUND_FR` est le seul curseur du partage surface / souterrain — la terre étant le reliquat, descendre la rue l'amincit et rend la hauteur au décor, sans toucher à la coupe.

Un motif répété qui se répète au premier plan doit être **ancré au monde** (`cam × parallaxe`, modulo son pas) et ses dimensions **arrondies à l'entier dès le calcul** : avec un pas fractionnaire, `px()` arrondit chaque motif séparément et les joints deviennent irréguliers. Le carrelage du tunnel et les traverses du ballast se dessinaient en coordonnées écran pures — les seuls éléments immobiles du panorama, et les plus proches de la caméra.

Deux points d'ordre à connaître dans `drawPanorama()` : le **lavis d'aube** est posé après les astres et avant le décor, pour baigner ciel, lune et étoiles sans toucher la ville — et parce que le croissant est taillé en repeignant un disque couleur `sky`, qui laisserait une tache sombre si la lueur était déjà en place. Les **trois plans de la basilique** descendent tous jusqu'au terrain : la parallaxe les écarte latéralement, et un bloc qui s'arrête à mi-hauteur laisse voir le vide sous ses pieds dès que la basilique n'est plus centrée.

Deux règles à ne pas casser : `ctx.imageSmoothingEnabled = false`, et l'arrondi entier de chaque rectangle dans `px()`. Sans elles l'effet pixel-art tombe.

---

## Mobile

Même mise en page qu'en desktop, **texte fortement réduit** — pas de layout mobile séparé. Toutes les tailles sont en `clamp()` avec un plancher bas et un facteur `vw` élevé.

- Sous **680 px**, l'en-tête ne garde que le logo et le bouton « Me parler » ; les trois liens texte disparaissent.
- Sous **620 px** de viewport, la boucle de la rame ligne 12 est doublée : deux fois moins de passages, décor moins chargé.
- Chaque panneau est `overflow:hidden` sur `100vh`. **Contenu et paddings doivent tenir sous 100vh à 540 px de haut**, sinon le contenu centré déborde et chevauche le panorama. C'est la contrainte qui dimensionne le panneau Parcours, dont les marges sont en `vh`.
- Le hero n'a pas de réserve basse : son contenu vit dans une boîte de `62vh`, ce qui garantit que « Scrollez » ne passe jamais sur les toits.

---

## Points d'attention

- **Le scroll est la seule source de vérité.** `progress` est recalculé sur `scroll`, `resize` et via un `ResizeObserver` sur le sticky. Ne pas introduire d'état React dérivé du scroll : la boucle est volontairement impérative.
- **`measure()` pose les hauteurs en pixels** à partir de `window.innerHeight`. Les valeurs CSS (`700vh` / `100vh`) ne servent que de repli avant le premier passage.
- **La navigation est un tween JS de 640 ms** sur `window.scrollTo`, interrompu dès que l'utilisateur touche la molette, l'écran ou le clavier.
- **`GEMINI_API_KEY` n'est pas utilisée.** Aucun fichier de `src/` ne lit `process.env` ni `import.meta.env` ; seul le `define` de [`vite.config.ts`](vite.config.ts) en garde la trace.
- **`framer-motion` et `lucide-react` restent dans `package.json`** alors que plus rien dans `src/` ne les importe : elles sont conservées pour que `archive/` reste exécutable. Vite les élimine du bundle.
- **`doc/` est ignoré par Git** : c'est le dossier de références de design (handoff, prototypes `.dc.html`, captures), local uniquement.

---

## Déploiement

```bash
npm run build
```

Le build produit un site entièrement statique dans `dist/` (~73 kB gzippés), déployable tel quel sur n'importe quel hébergeur statique.

Aucune configuration de déploiement n'est versionnée dans ce dépôt : elle est tenue côté hébergeur. Les mises en production se font par push sur `main`.

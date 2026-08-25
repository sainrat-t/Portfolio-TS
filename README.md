# Portfolio — Thibaut Sainrat

Portfolio personnel à double lecture : **Head of Product** d'un côté, **AI Builder** de l'autre. Un interrupteur en haut de page fait basculer l'intégralité du site d'une identité à l'autre — contenu, palette, typographie, décor de fond et jusqu'au ton des libellés.

En production : [thibautsainrat.fr](https://thibautsainrat.fr)

---

## Le concept

Le site n'a pas de pages. Il a **deux modes**, portés par un seul état (`ViewMode = 'strategist' | 'builder'`) déclaré dans [`src/App.tsx`](src/App.tsx) et propagé partout.

|  | Strategist | Builder |
|---|---|---|
| Ce qu'il raconte | la carrière salariée | l'activité indépendante et le labo |
| Palette | ardoise clair, accent bleu | ardoise nuit, accent émeraude |
| Typographie | Inter | JetBrains Mono |
| Décor | blobs organiques qui respirent | grille technique + halo émeraude |
| Contenu | 3 cartes de compétences + parcours chronologique | projets mis en avant, archives du labo, MVP en cours |

La bascule est animée par `AnimatePresence mode="wait"` : la vue sortante finit son animation avant que l'entrante ne se monte. Le décor de fond ([`Background.tsx`](src/components/Background.tsx)) fait la même transition en parallèle, sur 1,5 s.

Chaque mode a aussi son avatar, affiché en angle sur grand écran uniquement (`hidden lg:block`).

---

## Stack

| | |
|---|---|
| Build | Vite 6 |
| UI | React 19, TypeScript 5.8 |
| Animation | Framer Motion 12 |
| Icônes | lucide-react |
| Styles | Tailwind CSS via CDN, configuré en ligne dans [`index.html`](index.html) |
| Polices | Inter + JetBrains Mono (Google Fonts) |

Pas de fichier `tailwind.config.js`, pas d'étape de compilation CSS : Tailwind est chargé par `<script src="https://cdn.tailwindcss.com">` et sa configuration (polices, palettes nommées) est écrite directement dans le `<head>`.

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

> Aucune variable d'environnement n'est nécessaire — voir [Points d'attention](#points-dattention).

### Routes

| URL | Rendu |
|---|---|
| `/` | le portfolio |
| `/og-preview` | aperçu HTML de l'image Open Graph, à l'échelle 1200×630 |

Le routage est un simple test sur `window.location.pathname` dans `App.tsx` — il n'y a pas de routeur.

---

## Structure

```
app/
  opengraph-image.tsx        image OG (format Next.js — hors build, cf. Points d'attention)
public/
  icon.svg                   favicon, monogramme « TS »
  avatar.png                 avatar mode Strategist
  avatar_neo.png             avatar mode Builder
src/
  index.tsx                  point d'entrée React
  App.tsx                    hero, switch, footer, routage
  types.ts                   ViewMode, Project
  data/
    projects.tsx             ← contenu des cartes projet
  components/
    Background.tsx           décor animé, un par mode
    Switch.tsx               la bascule Strategist / Builder
    ProjectCard.tsx          carte projet, variante mise en avant ou standard
    MusicBattleDemo.tsx      démo interactive archivée + sa pop-in
    OGPreview.tsx            réplique HTML de l'image OG
    sections/
      StrategistView.tsx     ← compétences + parcours
      BuilderView.tsx        assemblage des sections du mode Builder
    ui/
      Badge.tsx              pastille, déclinée par mode
      Button.tsx             bouton, décliné par mode et par variante
      LamaIcon.tsx           marque Studio Lamarck, SVG inline
index.html                   Tailwind CDN + configuration + polices
vite.config.ts
```

---

## Modifier le contenu

Tout le contenu est en dur dans les sources. Il n'y a ni CMS ni fichier de données centralisé — voici où chaque chose se trouve.

| À modifier | Fichier | Repère |
|---|---|---|
| Nom, sous-titres, baseline | [`src/App.tsx`](src/App.tsx) | le `<header>` |
| Liens du footer (blog, LinkedIn, mail, GitHub) | [`src/App.tsx`](src/App.tsx) | le `<footer>` |
| Cartes de compétences | [`src/components/sections/StrategistView.tsx`](src/components/sections/StrategistView.tsx) | JSX en dur, en haut du rendu |
| Parcours professionnel | [`src/components/sections/StrategistView.tsx`](src/components/sections/StrategistView.tsx) | tableau `experiences` |
| Projets (cartes) | [`src/data/projects.tsx`](src/data/projects.tsx) | tableau `projects` |
| Démo Music Battle et sa pop-in | [`src/components/MusicBattleDemo.tsx`](src/components/MusicBattleDemo.tsx) | — |
| Titres de section du mode Builder | [`src/components/sections/BuilderView.tsx`](src/components/sections/BuilderView.tsx) | — |
| Titre d'onglet, polices, palette Tailwind | [`index.html`](index.html) | — |

---

## Conventions à connaître

Plusieurs comportements d'affichage se déduisent des données. Les ignorer donne des résultats silencieusement faux.

### Le parcours

- **L'ordre du tableau `experiences` est l'ordre d'affichage.** Il est maintenu à la main, en chronologie inverse par date de début. Rien ne trie automatiquement.
- **Un poste est considéré comme en cours si son `period` contient le mot « Présent ».** C'est ce test qui déclenche la pastille bleue pulsante, le halo animé de la carte et le badge de date en bleu. Plusieurs postes peuvent l'être simultanément (cumul d'une activité indépendante et d'un poste salarié).

### Les projets

- **Un projet avec un `link` est mis en avant** dans « Current Highlights » ; **sans `link`**, il atterrit dans la grille « Active Development & MVPs ». C'est le seul critère.
- La grille des projets mis en avant passe **à deux colonnes dès qu'il y en a deux**, et reste en pleine largeur s'il n'y en a qu'un.
- `cta` définit le libellé du bouton d'un projet mis en avant. Absent, il retombe sur `« Rejoindre la Bêta »`.
- `status` pilote la couleur du badge via la table `statusStyles` de [`ProjectCard.tsx`](src/components/ProjectCard.tsx). Ajouter un statut demande donc **deux** modifications : la valeur dans l'union `Project['status']` de [`types.ts`](src/types.ts), et — si l'on veut une couleur dédiée — une entrée dans la table. Sans entrée, le statut prend l'ambre par défaut.

### Le langage chromatique

Les couleurs portent du sens ; c'est ce qui permet de lire le statut d'un bloc sans lire son texte.

| Couleur | Signification |
|---|---|
| Bleu | mode Strategist, carrière |
| Émeraude | mode Builder, ce qui est vivant / en ligne |
| Violet | produit phare avec bêta ouverte |
| Cyan | Studio Lamarck |
| Ambre | expérimentation archivée, ou projet en construction |

Le passage de l'émeraude à l'ambre est le signal d'archivage : c'est ce qui distingue la carte Music Battle (expérimentation close, démo rejouable en local) des projets actifs.

---

## Points d'attention

Quelques héritages et angles morts, à connaître avant de s'étonner.

- **`app/opengraph-image.tsx` ne fait pas partie du build.** Le fichier suit la convention Next.js et importe `next/og`, qui n'est pas installé. Il est ignoré par Vite (aucun module de `src/` ne l'importe), donc `npm run build` réussit — mais `npx tsc --noEmit` remonte une erreur `TS2307` sur cet import. C'est le seul échec de typage du dépôt. Pour prévisualiser le rendu, utiliser la route `/og-preview`, qui en est une réplique en React standard : **toute modification de l'image OG doit être reportée dans les deux fichiers**, ils ne partagent pas de code.
- **`GEMINI_API_KEY` n'est plus utilisée.** L'ancien README demandait de la renseigner dans `.env.local`. Aucun fichier de `src/` ne lit `process.env` ni `import.meta.env` ; seul le `define` de `vite.config.ts` en garde la trace. L'étape est inutile en l'état.
- **La palette nommée de `index.html` est morte.** Les tokens `builder-*` et `strategist-*` déclarés dans la configuration Tailwind en ligne ne sont référencés par aucun composant : tout est écrit en classes Tailwind brutes (`bg-slate-950`, `text-emerald-400`…).
- **L'`importmap` de `index.html` est un vestige** de la génération AI Studio. Vite résout les imports lui-même, en développement comme au build ; la carte n'est pas consultée.
- **L'interface `Experience` de `types.ts` n'est pas utilisée.** Le tableau `experiences` de `StrategistView` est un littéral non typé, dont les champs diffèrent d'ailleurs de l'interface (`desc` au lieu de `description`, pas d'`id`).
- **Tailwind par CDN** affiche un avertissement en console et calcule les classes à l'exécution. C'est assumé pour un site d'une page, mais cela exclut le purge et rend la feuille de styles dépendante d'un tiers.

---

## Déploiement

```bash
npm run build
```

Le build produit un site entièrement statique dans `dist/` (~112 kB gzippés), déployable tel quel sur n'importe quel hébergeur statique.

Aucune configuration de déploiement n'est versionnée dans ce dépôt : elle est tenue côté hébergeur. Les mises en production se font par push sur `main`.

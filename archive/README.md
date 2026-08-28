# Archive — portfolio v2 (modes Strategist / Builder)

Version précédente du portfolio, conservée pour référence. Remplacée en août 2026
par la refonte « Bridge » (panorama pixel-art du 18e, carrousel horizontal piloté
au scroll) — voir `src/` à la racine.

Ce dossier **n'est pas compilé** : il est exclu de `tsconfig.json` et n'est
importé par aucun point d'entrée. `archive/index.html` était l'ancien entrypoint
Vite (Tailwind CDN + importmap esm.sh).

Contenu :
- `index.html` — ancien shell (Tailwind CDN, importmap, thème dual)
- `src/` — App, Switch jour/nuit, vues Strategist & Builder, cartes projet, démo Music Battle
- `app/opengraph-image.tsx` — génération de l'image OG

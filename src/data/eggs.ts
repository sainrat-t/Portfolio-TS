/**
 * Easter eggs du panorama.
 *
 * L'`id` doit correspondre à celui d'une boîte renvoyée par `drawPanorama()` —
 * c'est le dessin lui-même qui fournit les coordonnées, jamais une copie.
 * Un egg sans boîte est simplement inerte, une boîte sans egg n'intercepte
 * aucun clic : on peut donc préparer les deux moitiés séparément.
 *
 * Rien dans la page ne les signale : ni curseur, ni survol, ni marqueur.
 */
export interface Egg {
  id: string;
  /** Titre de la barre de fenêtre, affiché en capitales mono. */
  window: string;
  title: string;
  body?: string[];
  link?: { label: string; href: string };
  image?: { src: string; alt: string };
  /** Petite icône posée à gauche du titre, comme dans une boîte de dialogue. */
  icon?: { src: string; alt: string };
  /** Code de déblocage, affiché en pied de fenêtre à côté du lien. */
  code?: { label: string; value: string };
  /** Certains eggs affichent un module interactif sous le texte. */
  demo?: 'music-battle' | 'mymemoires';
  /**
   * Déclencheur textuel : ce libellé exact, s'il apparaît dans une description
   * du Laboratoire, devient cliquable. Rien ne le signale — ni soulignement, ni
   * curseur. S'il ne correspond plus (réécriture du texte), la phrase s'affiche
   * simplement telle quelle : le lien se perd, rien ne casse.
   */
  textTrigger?: string;
}

export const EGGS: Egg[] = [
  {
    id: 'lama',
    window: 'Studio Lamarck',
    title: 'Le lama',
    body: [
      // TODO wording — à reprendre avec le reste.
      "Studio Lamarck est un studio associatif. J'y publie mes applications, et j'y accompagne celles et ceux qui veulent construire les leurs.",
      "Mon souhait est de redonner à chacun la liberté de créer — de laisser une vision s'incarner dans un produit digital plutôt que de rester une idée. L'IA a mis cette possibilité à la portée de tous.",
    ],
    link: { label: 'Voir le studio', href: 'https://studiolamarck.fr' },
  },
  {
    id: 'music-battle',
    window: 'Music Battle — archivé',
    title: 'Engagement-Weighted Voting',
    body: [
      "Pourquoi un clic de 100 ms pèserait-il autant qu'un vote mûri pendant deux minutes ?",
      "L'expérimentation est clôturée et l'instance n'est plus en ligne. La mécanique, elle, reste jouable ici.",
    ],
    demo: 'music-battle',
    textTrigger: 'Engagement-Weighted Voting',
  },
  {
    id: 'voxtral',
    window: 'Voxtral — Mistral AI',
    title: 'Des modèles européens',
    icon: { src: '/voxtral.svg', alt: 'Voxtral' },
    body: [
      'Pour MyMémoires je souhaite utiliser des modèles français ou européens. Mistral propose des modèles vocaux dans la gamme Voxtral qui sont très puissants.',
      "Je veux aussi de la diarisation, pour ouvrir les sessions d'enregistrement à plusieurs participants — un besoin B2B. Je vais sûrement creuser d'autres pistes (Gradium, ElevenLabs…).",
    ],
    link: {
      label: 'Voir le modèle',
      href: 'https://docs.mistral.ai/models/voxtral-mini-transcribe-26-02',
    },
    // Le seul mot « Voxtral » plutôt que « STT Voxtral » : le déclencheur survit
    // ainsi à une réécriture de la ligne de stack ou à une inversion des termes.
    textTrigger: 'Voxtral',
  },
  {
    id: 'portrait',
    window: 'Thibaut Sainrat',
    title: "C'est moi",
    image: { src: '/Avatar_new.jpeg', alt: 'Portrait illustré de Thibaut Sainrat' },
    textTrigger: 'Thibaut',
  },
  {
    id: 'mymemoires',
    window: 'MyMémoires — enregistrement',
    title: 'Recueillir une histoire',
    body: [
      "Le module d'enregistrement de MyMémoires, en déclinaison pixel. Une question guide l'entretien, la voix est captée, puis transcrite et mise en récit.",
      'Testez la maquette.',
    ],
    demo: 'mymemoires',
    link: { label: 'Rejoindre la bêta', href: 'https://www.mymemoires.com' },
    code: { label: "Débloquer le skin pixelisé de l'enregistreur", value: 'PXL-17892' },
  },
  {
    id: 'github',
    window: 'GitHub',
    title: 'Ce que je code',
    body: [
      "J'aime créer. Mes projets finissent là, aboutis ou non — c'est en construisant que je comprends vraiment un sujet.",
      "Le machine learning m'intéresse de plus en plus : je suis en ce moment la formation scikit-learn de l'Inria.",
    ],
    link: { label: 'Voir mon GitHub', href: 'https://github.com/sainrat-t' },
  },
];

export const EGGS_BY_ID: Record<string, Egg> = Object.fromEntries(EGGS.map((e) => [e.id, e]));

/**
 * Le compteur ne vit que le temps de la session : `sessionStorage` survit à un
 * rechargement d'onglet mais repart à zéro dans un nouvel onglet, ce qui est le
 * comportement voulu. L'accès peut lever (navigation privée, cookies bloqués),
 * d'où les try/catch : le compteur dégrade alors sans casser la page.
 */
const STORAGE_KEY = 'om-eggs-found';

export function readFoundEggs(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // On ne garde que des identifiants encore connus : un egg renommé ou retiré
    // laisserait sinon une entrée fantôme dans la session, et le compteur
    // afficherait un total dépassé (« 03 / 02 ») jusqu'à la fin de l'onglet.
    return parsed.filter((v): v is string => typeof v === 'string' && v in EGGS_BY_ID);
  } catch {
    return [];
  }
}

export function writeFoundEggs(ids: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* session indisponible : le compteur reste en mémoire, sans persistance */
  }
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  /** Les expériences en cours sont accentuées dans la timeline. */
  current?: boolean;
}

export interface Project {
  title: string;
  badge: string;
  desc: string;
  stack: string;
  href: string;
  cta: string;
}

export interface LabEntry {
  title: string;
  status: 'En cours' | 'Archivé';
  desc: string;
  stack: string;
}

export const EXPERIENCES: Experience[] = [
  { company: 'Cardiweb', role: 'CPO / Directeur de pôle', period: '2026 — présent', current: true },
  { company: 'MyMémoires', role: 'Fondateur', period: '2025 — présent', current: true },
  { company: 'Cardiweb', role: 'Head of Product Management', period: '2023 — 2026' },
  { company: 'Cardiweb', role: 'Lead Product Manager', period: '2022 — 2023' },
  { company: 'Cardiweb', role: 'Senior Product Manager', period: '2021 — 2022' },
  { company: 'Haulogy', role: 'Product Manager', period: '2018 — 2021' },
  { company: 'mc2i', role: 'Product Owner / AMOA — Enedis', period: '2015 — 2018' },
];

export const PROJECTS: Project[] = [
  {
    title: 'MyMémoires',
    badge: 'MVP',
    desc: "Recueillir et transmettre les histoires de vie de nos anciens. Guidage d'interview, enregistrement vocal, biographie littéraire générée.",
    stack: 'React-Expo · STT Voxtral · Docker · TypeScript',
    href: 'https://www.mymemoires.com',
    cta: 'Rejoindre la bêta',
  },
  {
    title: 'Studio Lamarck',
    badge: 'Asso',
    desc: "Studio associatif indépendant de développement de projets digitaux. Nous accompagnons des porteurs de projet du concept à la production.",
    stack: 'Product design · Hosting · GenAI · Indie software',
    href: 'https://studiolamarck.fr',
    cta: 'Voir le studio',
  },
];

export const LAB: LabEntry[] = [
  {
    title: 'Live History',
    status: 'En cours',
    desc: "Dialoguer avec des personnages historiques simulés pour saisir les nuances d'une époque.",
    stack: 'RAG · live TTS · React',
  },
  {
    title: 'Neon Riot',
    status: 'En cours',
    desc: "Stratégie arcade : des unités wind-up cybernétiques, du timing et de la gestion d'énergie.",
    stack: 'Godot · GDScript',
  },
  {
    title: 'Music Battle',
    status: 'Archivé',
    desc: "Invention d’une nouvelle interaction UX \"Engagement-Weighted Voting\" : pondérer un vote par l'engagement réel de l'utilisateur.",
    stack: 'React · Gamification',
  },
];

export const CONTACT = {
  email: 'sainrat.t@gmail.com',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thibaut-sainrat' },
    { label: 'Blog', href: 'https://sainrat.writizzy.blog/' },
  ],
};

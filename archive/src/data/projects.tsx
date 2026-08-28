import React from 'react';
import { Brain, History, Gamepad2 } from 'lucide-react';
import { LamaIcon } from '../components/ui/LamaIcon';
import { Project } from '../types';

export const projects: Project[] = [
  {
    title: "MyMémoires",
    icon: <Brain className="text-purple-400" size={24} />,
    status: "MVP Ready",
    description: "Une plateforme pour simplifier la transmission des histoires de vie des résidents en EHPAD. L'ambition est de guider l'interviewer et de structurer les récits. L'IA structure ensuite les enregistrements en biographies littéraires soignées.",
    link: "https://www.mymemoires.com",
    cta: "Rejoindre la Bêta",
    features: [
      "Enregistrement vocal simplifié",
      "Guidage d'interview par IA",
      "Génération de biographie"
    ],
    stack: ["React", "Supabase", "Gemini API", "Tailwind CSS", "TypeScript"]
  },
  {
    title: "Studio Lamarck",
    icon: <LamaIcon className="text-cyan-400" size={24} />,
    status: "Studio",
    description: "Studio de développement de projets dédié à l'innovation technologique et à la création numérique indépendante. J'y conçois et publie mes propres applications, et j'accompagne des porteurs de projet du concept jusqu'à la mise en production.",
    link: "https://studiolamarck.fr",
    cta: "Voir le studio",
    features: [
      "Innovation par l'expérimentation et le partage",
      "Accompagnement de créateurs indépendants",
      "Du concept à la mise en production"
    ],
    stack: ["Product Design", "Développement Web", "GenAI", "Indie Software"]
  },
  {
    title: "Live History",
    icon: <History className="text-amber-400" size={24} />,
    status: "Building",
    description: "Application éducative permettant de dialoguer naturellement avec des personnages historiques simulés pour comprendre les nuances d'une époque.",
    features: ["RAG (Retrieval Augmented Gen)", "Vector DB", "Personality Prompting"],
    stack: ["Google AI Studio", "React", "TypeScript", "Tailwind CSS", "Web Audio API"]
  },
  {
    title: "Neon Riot",
    icon: <Gamepad2 className="text-pink-400" size={24} />,
    status: "Building",
    description: "Jeu de stratégie arcade frénétique. Gérez des unités 'wind-up toys' cybernétiques. Le gameplay repose sur un timing précis et la gestion d'énergie.",
    features: ["Physique Arcade Flipper", "Mécanique de 'Wind-Up' Tactique", "Classes à Synergies"],
    stack: ["Godot", "GDScript", "Antigravity"]
  }
];
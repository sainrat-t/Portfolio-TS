import React from 'react';
import { Brain, History, Gamepad2 } from 'lucide-react';
import { Project } from '../types';

export const projects: Project[] = [
  {
    title: "Mémoire (MVP)",
    icon: <Brain className="text-purple-400" size={24} />,
    status: "MVP Ready",
    description: "Une plateforme pour simplifier la transmission des histoires de vie des résidents en EHPAD. L'ambition est de guider l'interviewer et de structurer les récits. L'IA structure ensuite les enregistrements en biographies littéraires soignées.",
    features: [
      "Enregistrement vocal simplifié",
      "Guidage d'interview par IA",
      "Contexte historique automatique",
      "Génération de biographie"
    ],
    stack: ["React Native", "Whisper API", "GPT-4", "Node.js"]
  },
  {
    title: "Live History",
    icon: <History className="text-amber-400" size={24} />,
    status: "Building",
    description: "Application éducative permettant de dialoguer naturellement avec des personnages historiques simulés pour comprendre les nuances d'une époque.",
    features: ["RAG (Retrieval Augmented Gen)", "Vector DB", "Personality Prompting"],
    stack: ["Python", "LangChain", "Pinecone"]
  },
  {
    title: "Neon Riot",
    icon: <Gamepad2 className="text-pink-400" size={24} />,
    status: "Building",
    description: "Jeu de stratégie arcade frénétique. Gérez des unités 'wind-up toys' cybernétiques. Le gameplay repose sur un timing précis et la gestion d'énergie.",
    features: ["Godot Engine", "Physique 2D", "Sound Design"],
    stack: ["Godot", "GDScript"]
  }
];
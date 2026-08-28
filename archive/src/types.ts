import React from 'react';

export type ViewMode = 'strategist' | 'builder';

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

export interface Project {
  title: string;
  icon: React.ReactNode;
  status: 'MVP Ready' | 'Building' | 'Shipped' | 'Prototype' | 'Studio';
  description: string;
  features: string[];
  stack: string[];
  link?: string;
  /** Label of the CTA shown when `link` is set. Defaults to "Rejoindre la Bêta". */
  cta?: string;
}
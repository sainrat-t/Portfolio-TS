import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExternalLink, Cpu, Zap, Flame } from 'lucide-react';
import { ProjectCard } from '../ProjectCard';
import { projects } from '../../data/projects';
import { MusicBattleDemo } from '../MusicBattleDemo';



export const BuilderView: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Hero / Highlight Project */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
          <Zap size={20} />
          Current Highlight
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => p.link).map((project, index) => (
            <div key={`featured-${index}`} className="md:col-span-2 lg:col-span-3">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>

      {/* Running */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
          <Flame size={20} />
          Running
        </h2>
        <MusicBattleDemo />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 font-mono px-4">
          <div>
            "J'utilise ce projet comme un laboratoire pour explorer comment le design de l'interaction peut influencer la pertinence d'un résultat communautaire."
          </div>
          <div className="md:text-right">
            Status: <span className="text-emerald-400">EN RUN</span>
          </div>
        </div>
      </div>

      {/* Other Projects Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
          <Cpu size={20} />
          Active Development & MVPs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => !p.link).map((project, index) => (
            <ProjectCard key={`standard-${index}`} project={project} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
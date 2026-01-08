import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExternalLink, Cpu, Zap, Flame } from 'lucide-react';
import { ProjectCard } from '../ProjectCard';
import { projects } from '../../data/projects';

// --- Engagement Voting Mechanic Component (Kept here as it is the "Hero" of this view) ---
const MusicBattleDemo: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const requestRef = useRef<number | null>(null);

  // Activity Tracker
  const handleActivity = () => {
    lastActivityRef.current = Date.now();
    if (!isActive && !hasVoted) setIsActive(true);
  };

  // Game Loop
  useEffect(() => {
    const checkActivity = () => {
      if (hasVoted) return;

      const now = Date.now();
      const timeSinceLastActive = now - lastActivityRef.current;

      if (timeSinceLastActive < 500) { // Considered active if interaction < 500ms ago
        setScore(prev => Math.min(prev + 1, 9999)); // Cap at 9999
        setIsActive(true);
      } else {
        setIsActive(false);
      }
      
      requestRef.current = requestAnimationFrame(checkActivity);
    };

    requestRef.current = requestAnimationFrame(checkActivity);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [hasVoted]);

  const handleVote = () => {
    setHasVoted(true);
    // Reset after a delay to play again
    setTimeout(() => {
      setHasVoted(false);
      setScore(0);
    }, 3000);
  };

  // Visual Intensity Calculations
  const intensity = Math.min(score / 500, 1); // 0 to 1
  const glowColor = `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`; // Emerald scaling
  const shake = isActive ? [0, -1, 1, 0] : 0;

  return (
    <div 
      onMouseMove={handleActivity}
      className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl transition-all duration-100"
      style={{
        boxShadow: `0 0 ${20 + intensity * 50}px ${glowColor}`,
        borderColor: `rgba(16, 185, 129, ${0.3 + intensity})`
      }}
    >
      {/* Background Particles/Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className={`w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold font-mono text-emerald-400">Music Battle</h3>
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${!isActive && 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
            </span>
          </div>
          <Badge mode="builder" className="animate-pulse">LIVE DEMO</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-emerald-400">Concept:</strong> Pourquoi un clic de 100ms vaut-il autant qu'un vote mûri de 2 minutes ?
            </p>
            <p className="text-slate-400 text-xs italic border-l-2 border-emerald-500/30 pl-3">
              Bougez votre souris dans ce cadre pour "charger" votre vote. C'est l'Engagement-Weighted Voting.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {['React', 'Socket.io', 'Gamification', 'UX Design'].map(tag => (
                <Badge key={tag} mode="builder">{tag}</Badge>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
               <a href="https://music-battle.onrender.com/" target="_blank" rel="noopener noreferrer">
                  <Button mode="builder" variant="secondary" className="text-xs h-8">
                    <ExternalLink size={14} className="mr-2" />
                    App Réelle
                  </Button>
               </a>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/50 border border-emerald-500/20 p-4 relative">
             <AnimatePresence mode="wait">
                {!hasVoted ? (
                  <motion.div 
                    className="text-center space-y-4"
                    animate={{ scale: 1 + intensity * 0.1 }}
                  >
                    <div className="text-slate-500 text-xs font-mono uppercase tracking-widest">Voting Power</div>
                    <motion.div 
                      animate={{ x: shake }}
                      transition={{ duration: 0.1, repeat: isActive ? Infinity : 0 }}
                      className="text-5xl font-black font-mono text-white tabular-nums"
                      style={{ textShadow: `0 0 ${intensity * 20}px rgba(16, 185, 129, 0.8)` }}
                    >
                      {score}
                    </motion.div>
                    
                    <button
                      onClick={handleVote}
                      className={`group relative inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all active:scale-95 ${isActive ? 'shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'grayscale opacity-50'}`}
                    >
                      <Flame size={18} className={`${isActive ? 'fill-yellow-300 text-yellow-300 animate-bounce' : ''}`} />
                      <span>CAST VOTE</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold text-emerald-400 mb-2">VOTE SENT!</div>
                    <div className="text-slate-400 font-mono">Power: {score}</div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
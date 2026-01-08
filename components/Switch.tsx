import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Terminal } from 'lucide-react';
import { ViewMode } from '../types';

interface SwitchProps {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export const Switch: React.FC<SwitchProps> = ({ mode, onToggle }) => {
  return (
    <div className="relative inline-flex h-12 w-64 items-center rounded-full bg-slate-200 p-1 dark:bg-slate-800">
      <div className="flex w-full justify-between z-10">
        <button
          onClick={() => onToggle('strategist')}
          className={`flex w-1/2 items-center justify-center gap-2 text-sm font-medium transition-colors duration-200 ${
            mode === 'strategist' ? 'text-blue-700' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Briefcase size={16} />
          <span>Strategist</span>
        </button>
        <button
          onClick={() => onToggle('builder')}
          className={`flex w-1/2 items-center justify-center gap-2 text-sm font-medium transition-colors duration-200 ${
            mode === 'builder' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Terminal size={16} />
          <span>Builder</span>
        </button>
      </div>
      <motion.div
        className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-sm"
        animate={{
          x: mode === 'strategist' ? 0 : '100%',
          backgroundColor: mode === 'strategist' ? '#ffffff' : '#1e293b',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
          {/* Decorative border/glow for builder mode */}
          {mode === 'builder' && (
              <div className="absolute inset-0 rounded-full border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
          )}
      </motion.div>
    </div>
  );
};
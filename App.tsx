import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Linkedin, Mail, Github } from 'lucide-react';
import { Switch } from './components/Switch';
import { StrategistView } from './components/sections/StrategistView';
import { BuilderView } from './components/sections/BuilderView';
import { ViewMode } from './types';

// --- Background Component ---
const Background: React.FC<{ mode: ViewMode }> = ({ mode }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {mode === 'strategist' ? (
          <motion.div
            key="strategist-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {/* Organic breathing blobs for Strategist */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 20, 0],
                x: [0, 30, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-100/50 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -40, 0],
                y: [0, 40, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] bg-indigo-100/40 rounded-full blur-[120px]"
            />
          </motion.div>
        ) : (
          <motion.div
            key="builder-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {/* Tech Grid for Builder */}
            <div 
              className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
              }}
            />
            
            {/* Subtle Emerald Glow */}
            <motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[100px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState<ViewMode>('strategist');

  const themeClasses = {
    strategist: "bg-slate-50 text-slate-900",
    builder: "bg-slate-950 text-slate-200"
  };

  const containerClasses = {
    strategist: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20",
    builder: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20"
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-700 ease-in-out ${themeClasses[mode]}`}>
      
      <Background mode={mode} />

      {/* Strategist Avatar - Fixed Top Left (Desktop Only) */}
      <AnimatePresence>
        {mode === 'strategist' && (
          <motion.div
            initial={{ opacity: 0, x: -100, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            exit={{ opacity: 0, x: -50, rotate: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            className="fixed top-8 left-8 z-50 hidden lg:block"
          >
             <div className="relative group cursor-pointer">
                {/* Note: Ensure a file named 'avatar.png' exists in your public folder */}
                <img 
                  src="/avatar.png" 
                  alt="Thibaut Sainrat" 
                  className="w-32 h-auto rounded-xl border-4 border-white shadow-xl transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0 bg-slate-200"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative z-10 ${containerClasses[mode]}`}>
        
        {/* Header / Hero */}
        <header className="flex flex-col items-center text-center space-y-8 mb-16">
          <div className="space-y-4 max-w-2xl">
            <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight transition-colors duration-500 ${
              mode === 'builder' ? 'font-mono text-emerald-400' : 'text-slate-900'
            }`}>
              Thibaut Sainrat
            </h1>
            <p className={`text-xl md:text-2xl font-medium transition-colors duration-500 ${
              mode === 'builder' ? 'text-slate-400 font-mono' : 'text-slate-600'
            }`}>
              {mode === 'strategist' ? 'Head of Product' : 'AI Engineer'} 
              <span className="opacity-50 mx-2">&</span> 
              {mode === 'strategist' ? 'AI Builder' : 'Product Strategist'}
            </p>
            <p className={`max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${
              mode === 'builder' ? 'text-slate-500 font-mono text-sm' : 'text-slate-600'
            }`}>
              "Je combine vision stratégique et prototypage technique pour transformer l'IA en produits viables. Je navigue entre le leadership produit et le code."
            </p>
          </div>

          <div className="pt-4">
            <Switch mode={mode} onToggle={setMode} />
            <p className={`mt-4 text-xs tracking-widest uppercase transition-opacity duration-500 ${
                mode === 'builder' ? 'text-emerald-500/50 opacity-100 font-mono' : 'opacity-0'
            }`}>
                Initialize Protocol: Lab
            </p>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {mode === 'strategist' ? (
              <StrategistView key="strategist" />
            ) : (
              <BuilderView key="builder" />
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className={`mt-20 py-8 border-t transition-colors duration-500 ${
          mode === 'builder' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-sm ${mode === 'builder' ? 'font-mono' : ''}`}>
              © {new Date().getFullYear()} Thibaut Sainrat.
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://www.linkedin.com/in/thibaut-sainrat" 
                target="_blank" 
                rel="noreferrer"
                className={`transition-colors ${
                  mode === 'builder' ? 'hover:text-emerald-400' : 'hover:text-blue-600'
                }`}
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a 
                href="mailto:sainrat.t@gmail.com" 
                className={`transition-colors ${
                  mode === 'builder' ? 'hover:text-emerald-400' : 'hover:text-blue-600'
                }`}
              >
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </a>
              {mode === 'builder' && (
                <a 
                  href="https://github.com/sainrat-t" 
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-emerald-400"
                >
                  <Github size={20} />
                  <span className="sr-only">GitHub</span>
                </a>
              )}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
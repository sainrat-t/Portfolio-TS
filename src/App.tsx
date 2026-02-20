import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Linkedin, Mail, Github } from 'lucide-react';
import { Switch } from './components/Switch';
import { Background } from './components/Background';
import { StrategistView } from './components/sections/StrategistView';
import { BuilderView } from './components/sections/BuilderView';
import { ViewMode } from './types';



import { OGPreview } from './components/OGPreview';

export default function App() {
  if (window.location.pathname === '/og-preview') {
    return <OGPreview />;
  }

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


      <div className={`relative z-10 ${containerClasses[mode]}`}>

        {/* Header / Hero */}
        <header className="relative flex flex-col items-center text-center space-y-8 mb-16">
          <AnimatePresence>
            {mode === 'strategist' && (
              <motion.div
                initial={{ opacity: 0, x: -100, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                exit={{ opacity: 0, x: -50, rotate: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                className="absolute top-0 left-0 z-50 hidden lg:block"
              >
                <div className="relative group cursor-pointer">
                  {/* Note: Ensure a file named 'avatar.png' exists in your public folder */}
                  <img
                    src="/avatar.png"
                    alt="Thibaut Sainrat"
                    className="w-32 lg:w-48 h-auto rounded-xl border-4 border-white shadow-xl transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0 bg-slate-200"
                  />
                </div>
              </motion.div>
            )}

            {/* Builder Avatar - Fixed Top Right (Desktop Only) */}
            {mode === 'builder' && (
              <motion.div
                initial={{ opacity: 0, x: 100, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: -3 }}
                exit={{ opacity: 0, x: 50, rotate: 10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                className="absolute top-0 right-0 z-50 hidden lg:block"
              >
                <div className="relative group cursor-pointer">
                  <img
                    src="/avatar_neo.png"
                    alt="Thibaut Sainrat"
                    className="w-32 lg:w-48 h-auto rounded-xl border-4 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0 bg-slate-900"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-4 max-w-2xl">
            <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight transition-colors duration-500 ${mode === 'builder' ? 'font-mono text-emerald-400' : 'text-slate-900'
              }`}>
              Thibaut Sainrat
            </h1>
            <p className={`text-xl md:text-2xl font-medium transition-colors duration-500 ${mode === 'builder' ? 'text-slate-400 font-mono' : 'text-slate-600'
              }`}>
              {mode === 'strategist' ? 'Head of Product' : 'AI Builder'}
              <span className="opacity-50 mx-2">&</span>
              {mode === 'strategist' ? 'AI Builder' : 'Product Strategist'}
            </p>
            <p className={`max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${mode === 'builder' ? 'text-slate-500 font-mono text-sm' : 'text-slate-600'
              }`}>
              "Je combine vision stratégique et prototypage technique pour transformer l'IA en produits viables. Je navigue entre le leadership produit et le code."
            </p>
          </div>

          <div className="pt-4">
            <Switch mode={mode} onToggle={setMode} />
            <p className={`mt-4 text-xs tracking-widest uppercase transition-opacity duration-500 ${mode === 'builder' ? 'text-emerald-500/50 opacity-100 font-mono' : 'opacity-0'
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
        <footer className={`mt-20 py-8 border-t transition-colors duration-500 ${mode === 'builder' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
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
                className={`transition-colors ${mode === 'builder' ? 'hover:text-emerald-400' : 'hover:text-blue-600'
                  }`}
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:sainrat.t@gmail.com"
                className={`transition-colors ${mode === 'builder' ? 'hover:text-emerald-400' : 'hover:text-blue-600'
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
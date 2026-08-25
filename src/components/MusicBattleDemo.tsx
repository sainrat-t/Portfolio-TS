import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Archive, Flame, Mail, Linkedin, X, Square } from 'lucide-react';

export const MusicBattleDemo: React.FC = () => {
    const [score, setScore] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const requestRef = useRef<number | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

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

    // Modal: close on Escape, lock background scroll, move focus in
    useEffect(() => {
        if (!showArchiveModal) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowArchiveModal(false);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [showArchiveModal]);

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
    const shake = isActive ? [0, -1, 1, 0] : 0;

    return (
        <>
            <div
                onMouseMove={handleActivity}
                className="relative overflow-hidden rounded-xl border border-amber-900/50 bg-slate-900 p-6 shadow-2xl transition-all duration-100"
            >
                {/* Archive texture: sepia glow + scanlines */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className={`w-full h-full opacity-[0.12] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/30 to-transparent transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, rgba(245,158,11,0.045) 0px, rgba(245,158,11,0.045) 1px, transparent 1px, transparent 4px)'
                        }}
                    />
                </div>

                {/* Watermark stamp — reads as a rubber-stamped archive document */}
                <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none select-none">
                    <div className="-rotate-12 border-[6px] border-double border-amber-500/[0.13] px-8 py-4">
                        <div className="font-mono text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-amber-500/[0.13] whitespace-nowrap">
                            Archivé
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold font-mono text-slate-300">Music Battle</h3>
                            {/* Stopped indicator: a static "stop" square replaces the live pulse */}
                            <Square size={10} className="fill-amber-600/70 text-amber-600/70" />
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/40 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-400">
                            <Archive size={11} />
                            ARCHIVÉ
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                <strong className="text-amber-400">Concept :</strong> Pourquoi un clic de 100ms vaut-il autant qu'un vote mûri de 2 minutes ?
                            </p>
                            <p className="text-slate-400 text-xs italic border-l-2 border-amber-500/30 pl-3">
                                Expérimentation terminée : l'instance n'est plus en ligne. La mécanique reste jouable ici, en local — bougez votre souris dans ce cadre pour "charger" votre vote. C'est l'Engagement-Weighted Voting.
                            </p>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {['React', 'Google AI Studio', 'Gamification', 'UX Design'].map(tag => (
                                    <Badge key={tag} mode="builder">{tag}</Badge>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    mode="builder"
                                    variant="secondary"
                                    className="text-xs h-8"
                                    onClick={() => setShowArchiveModal(true)}
                                >
                                    <Archive size={14} className="mr-2" />
                                    {'>'} Run App_
                                </Button>
                            </div>
                        </div>

                        {/* Interaction Area — replay mode */}
                        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/50 border border-amber-500/20 p-4 relative">
                            <AnimatePresence mode="wait">
                                {!hasVoted ? (
                                    <motion.div
                                        className="text-center space-y-4"
                                        animate={{ scale: 1 + intensity * 0.1 }}
                                    >
                                        <div className="text-slate-500 text-xs font-mono uppercase tracking-widest">Voting Power — Replay</div>
                                        <motion.div
                                            animate={{ x: shake }}
                                            transition={{ duration: 0.1, repeat: isActive ? Infinity : 0 }}
                                            className="text-5xl font-black font-mono text-slate-200 tabular-nums"
                                            style={{ textShadow: `0 0 ${intensity * 20}px rgba(245, 158, 11, 0.8)` }}
                                        >
                                            {score}
                                        </motion.div>

                                        <button
                                            onClick={handleVote}
                                            className={`group relative inline-flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-full transition-all active:scale-95 ${isActive ? 'shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'grayscale opacity-50'}`}
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
                                        <div className="text-3xl font-bold text-amber-400 mb-2">VOTE ENVOYÉ</div>
                                        <div className="text-slate-400 font-mono text-sm">Power : {score}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Archive Pop-in */}
            <AnimatePresence>
                {showArchiveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setShowArchiveModal(false)}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="archive-modal-title"
                            initial={{ opacity: 0, scale: 0.94, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-amber-500/30 bg-slate-900 shadow-2xl"
                        >
                            {/* Terminal-style title bar */}
                            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700" />
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700" />
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-600/70" />
                                    <span className="ml-2 truncate font-mono text-xs text-slate-500">~/lab/music-battle — archived</span>
                                </div>
                                <button
                                    ref={closeButtonRef}
                                    onClick={() => setShowArchiveModal(false)}
                                    aria-label="Fermer"
                                    className="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg border border-amber-500/30 bg-amber-950/40 p-2">
                                        <Archive size={20} className="text-amber-400" />
                                    </div>
                                    <h3 id="archive-modal-title" className="font-mono text-lg font-bold text-slate-200">
                                        Expérimentation clôturée
                                    </h3>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-400">
                                    Music Battle était un laboratoire sur l'<span className="text-amber-400">Engagement-Weighted Voting</span> : pondérer un vote selon l'engagement réel plutôt que selon la vitesse du clic. L'expérimentation est terminée et l'instance n'est plus hébergée.
                                </p>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    La mécanique reste jouable sur cette page, en local. Si le sujet vous intéresse — protocole, enseignements, code —, écrivez-moi : je partage volontiers.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <a
                                        href="mailto:sainrat.t@gmail.com?subject=Music%20Battle%20%E2%80%94%20en%20savoir%20plus"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2 font-mono text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
                                    >
                                        <Mail size={15} />
                                        Me contacter
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/thibaut-sainrat"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-sm text-slate-200 transition-colors hover:bg-slate-700"
                                    >
                                        <Linkedin size={15} />
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode } from '../types';

interface BackgroundProps {
    mode: ViewMode;
}

export const Background: React.FC<BackgroundProps> = ({ mode }) => {
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
                                x: "-50%"
                            }}
                            style={{ x: "-50%" }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-[20%] left-1/2 w-[60vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[100px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import React from 'react';
import { ViewMode } from '../../types';

interface BadgeProps {
  mode: ViewMode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ mode, children, className = '' }) => {
  const styles = {
    strategist: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200/80",
    builder: "border-emerald-500/30 bg-emerald-950/30 text-emerald-400 font-mono text-xs border"
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[mode]} ${className}`}>
      {children}
    </div>
  );
};
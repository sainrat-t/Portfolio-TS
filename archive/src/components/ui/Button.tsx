import React from 'react';
import { ViewMode } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  mode: ViewMode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  mode, 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  
  const variants = {
    strategist: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
      outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 text-slate-900"
    },
    builder: {
      primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 font-mono border border-slate-700",
      outline: "border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30 font-mono"
    }
  };

  const selectedVariant = variants[mode][variant];

  return (
    <button 
      className={`${baseStyles} ${selectedVariant} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
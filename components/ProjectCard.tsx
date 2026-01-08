import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './ui/Badge';
import { Project } from '../types';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        // Only check overflow when in collapsed state to know if we need the button.
        // If expanded, we keep the button visible (state preserved) so user can collapse.
        if (!isExpanded) {
           // We use a small tolerance (1px) for subpixel rendering differences
           const isClamped = element.scrollHeight > element.clientHeight + 1;
           setShowReadMore(isClamped);
        }
      }
    };

    // Check initially and whenever description or expansion state changes
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [isExpanded, project.description]);

  return (
    <div 
      className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-600 transition-colors h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition-colors">
          {project.icon}
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${
          project.status === 'MVP Ready' 
            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
            : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
        }`}>
          {project.status}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-200 mb-2 font-mono">{project.title}</h3>
      
      <div className="mb-4">
        <div 
            ref={textRef}
            className={`text-slate-400 text-sm leading-relaxed transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-3'
        }`}>
          {project.description}
        </div>
        
        {/* Only show button if overflow was detected or if currently expanded */}
        {(showReadMore || isExpanded) && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors focus:outline-none"
            >
                {isExpanded ? '[-] Show Less' : '[+] Read More'}
            </button>
        )}
      </div>

      {/* Feature list for context */}
      {project.features && (
        <ul className="mb-6 space-y-1">
          {project.features.slice(0, 3).map((feat: string, i: number) => (
            <li key={i} className="flex items-center text-xs text-slate-500">
              <span className="mr-2 h-1 w-1 rounded-full bg-slate-600"></span>
              {feat}
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-auto pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
        {project.stack.map((tech: string) => (
          <Badge key={tech} mode="builder">{tech}</Badge>
        ))}
      </div>
    </div>
  );
};
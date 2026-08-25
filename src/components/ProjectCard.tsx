import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Project } from '../types';

const statusStyles: Record<string, string> = {
  'MVP Ready': 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  'Studio': 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  default: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
};

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

    // Use ResizeObserver for more robust size detection than just window resize
    const resizeObserver = new ResizeObserver(() => checkOverflow());

    // Check initially
    checkOverflow();

    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isExpanded, project.description]);

  return (
    <div
      className={`group flex flex-col rounded-xl border p-6 transition-all duration-300 h-full relative overflow-hidden ${project.link
        ? 'border-purple-500/50 bg-slate-900/80 hover:border-purple-400 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]'
        : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
        }`}
    >
      {/* Optional subtle background glow for featured projects */}
      {project.link && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition-colors">
          {project.icon}
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${statusStyles[project.status] ?? statusStyles.default}`}>
          {project.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-slate-200 font-mono">
          {project.title}
        </h3>
      </div>

      <div className="mb-4">
        <div
          ref={textRef}
          className={`text-slate-400 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'
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

      {/* Prominent CTA for projects with a link */}
      {project.link && (
        <div className="flex gap-3 mt-2 mb-6">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-purple-500 hover:bg-purple-400 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] z-10"
          >
            <ExternalLink size={14} />
            <span>{project.cta ?? 'Rejoindre la Bêta'}</span>
          </a>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
        {project.stack.map((tech: string) => (
          <Badge key={tech} mode="builder">{tech}</Badge>
        ))}
      </div>
    </div>
  );
};
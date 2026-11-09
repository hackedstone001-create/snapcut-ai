import React from 'react';
import { Scissors, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
            <Scissors className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-white">SnapCut AI</p>
            <p className="text-[11px] text-slate-400">Fast, free, 1-click AI background removal</p>
          </div>
        </div>

        {/* Privacy Assurance Badge (Section 11) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Images are never stored permanently & auto-deleted after processing.</span>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right">
          <p>© {new Date().getFullYear()} SnapCut AI. Built with precision.</p>
        </div>

      </div>
    </footer>
  );
};

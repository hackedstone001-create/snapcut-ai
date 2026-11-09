import React from 'react';
import { Scissors, Sparkles, Sliders, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onOpenPricing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
            <Scissors className="w-5 h-5 -rotate-45" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SnapCut<span className="text-indigo-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI 2.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#editor" className="hover:text-white transition-colors">
            Workspace
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <button
            onClick={onOpenPricing}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Pricing</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Free
            </span>
          </button>
        </nav>

        {/* Actions & Settings */}
        <div className="flex items-center gap-3">
          {/* Mode Indicator Pill */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all hover:bg-slate-850"
            title="Configure AI Engine & n8n settings"
          >
            <div className={`w-2 h-2 rounded-full ${settings.mode === 'n8n' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="hidden sm:inline font-medium">
              {settings.mode === 'n8n' ? 'n8n Cloud Engine' : 'Instant In-Browser AI'}
            </span>
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          <button
            onClick={onOpenPricing}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Go Unlimited</span>
          </button>
        </div>

      </div>
    </header>
  );
};

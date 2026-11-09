import React from 'react';
import { Sparkles, ShieldCheck, Zap, Image as ImageIcon } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Next-Gen Neural Edge Detection</span>
        <span className="w-1 h-1 rounded-full bg-indigo-400" />
        <span className="text-slate-400">Zero Cloud Latency Mode</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
        Remove Any Image Background{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
          in 1 Click with AI
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Say goodbye to tedious pen tools and expensive subscriptions. Upload any product photo, portrait, or logo to get clean, professional cutouts in seconds.
      </p>

      {/* Key Value Props Pill Row */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-medium">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Sub-second Processing
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          100% Private (No permanent storage)
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          PNG, JPG, WEBP Support
        </span>
      </div>
    </section>
  );
};

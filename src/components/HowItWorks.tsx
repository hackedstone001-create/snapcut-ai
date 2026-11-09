import React from 'react';
import { Upload, Cpu, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Image',
      description: 'Drag & drop any photo (PNG, JPG, WEBP) or paste directly from your clipboard. Up to 20MB supported.',
      icon: Upload,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      step: '02',
      title: 'AI Detects Subject & Edges',
      description: 'Our neural segmentation engine separates people, products, or objects from complex backgrounds within milliseconds.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      step: '03',
      title: 'Preview & Download Cutout',
      description: 'Compare with the split-screen slider, switch backdrops, or download instant transparent HD PNGs for free.',
      icon: Download,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Simple 3-Step Process
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2">
          How SnapCut AI Works
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          No complex tools or manual lassoing. Get studio-grade transparency in 3 easy steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

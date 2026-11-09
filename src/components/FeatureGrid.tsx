import React from 'react';
import { 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  ShoppingBag, 
  Palette 
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'One-Click Instant Removal',
      description: 'Upload your photo and our AI removes the backdrop automatically in seconds without any manual brush work.',
    },
    {
      icon: Sparkles,
      title: 'Sub-Pixel Edge Precision',
      description: 'Clean boundary detection handles intricate details including hair strands, fur, transparent glass, and fine textures.',
    },
    {
      icon: ShieldCheck,
      title: '100% Privacy & Ephemeral Processing',
      description: 'Your uploaded photos are processed on-the-fly and never stored permanently or sold. Complete security for your assets.',
    },
    {
      icon: Sliders,
      title: 'Interactive Split-Screen Preview',
      description: 'Drag the live before/after slider to inspect transparency and edge fidelity before downloading.',
    },
    {
      icon: ShoppingBag,
      title: 'Tailored for E-Commerce',
      description: 'Ideal for Amazon, Shopify, eBay, and Etsy listings. Produce crisp white or transparent product photos effortlessly.',
    },
    {
      icon: Palette,
      title: 'Studio Backdrops & Colors',
      description: 'Easily swap transparent cutouts with clean solid studio colors, aesthetic gradients, or custom uploaded photos.',
    },
  ];

  const audiences = [
    'E-Commerce Sellers',
    'Graphic Designers',
    'Content Creators',
    'Marketing Teams',
    'Small Business Owners',
    'Students & Educators',
  ];

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
      
      {/* Target Audience Pill Cloud */}
      <div className="mb-14 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Built for modern workflows
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {audiences.map((aud, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
            >
              {aud}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Core Capabilities
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2">
          Everything You Need for Pro Cutouts
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Engineered to give you high-resolution results in seconds, right from your web browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-900/70 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

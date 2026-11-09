import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  RotateCcw, 
  Copy, 
  Check, 
  Eye, 
  Layers, 
  Palette, 
  Sparkles, 
  Zap, 
  SlidersHorizontal
} from 'lucide-react';
import { BackgroundStyle, ProcessedImageResult } from '../types';
import confetti from 'canvas-confetti';

interface ImageEditorProps {
  result: ProcessedImageResult;
  onReset: () => void;
}

const COLOR_PRESETS = [
  '#ffffff',
  '#f8fafc',
  '#0f172a',
  '#000000',
  '#3b82f6',
  '#10b981',
  '#f43f5e',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
];

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ result, onReset }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>({ type: 'transparent' });
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'cutout'>('slider');
  const [isCopied, setIsCopied] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);

  // Handle slider mouse & touch drag
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onMouseUp = () => setIsDraggingSlider(false);
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingSlider]);

  // Copy transparent image to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const res = await fetch(result.processedUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert('Could not copy image directly to clipboard on this browser. Please use the Download button.');
    }
  };

  // Download final image (transparent or composite with custom background)
  const handleDownload = async (format: 'png' | 'jpg') => {
    setIsExporting(true);
    try {
      if (bgStyle.type === 'transparent' && format === 'png') {
        // Direct transparent download - fetch as blob so cross-origin Cloudinary URLs download as files
        try {
          const res = await fetch(result.processedUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = result.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch {
          const a = document.createElement('a');
          a.href = result.processedUrl;
          a.download = result.fileName;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        // Compose on hidden canvas with background
        const canvas = document.createElement('canvas');
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        // Draw background
        if (bgStyle.type === 'color') {
          ctx.fillStyle = bgStyle.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgStyle.type === 'gradient') {
          // Approximate gradient
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#667eea');
          grad.addColorStop(1, '#764ba2');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgStyle.type === 'custom') {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          await new Promise((res) => {
            bgImg.onload = res;
            bgImg.src = bgStyle.url;
          });
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        }

        // Draw cutout on top
        const cutImg = new Image();
        cutImg.crossOrigin = 'anonymous';
        await new Promise((res) => {
          cutImg.onload = res;
          cutImg.src = result.processedUrl;
        });
        ctx.drawImage(cutImg, 0, 0, canvas.width, canvas.height);

        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        const exportUrl = canvas.toDataURL(mime, 0.95);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = result.fileName.replace(/\.png$/, `.${format}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
      alert('Error exporting image');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle custom background image upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBgStyle({ type: 'custom', url });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
      {/* Top Bar with Metrics & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6 backdrop-blur-md">
        
        {/* Left: Resolution & Latency badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{result.width} × {result.height} px</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{result.processingTimeMs} ms</span>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[200px]">
            {result.fileName}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'slider'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('cutout')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'cutout'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Cutout Only</span>
          </button>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Photo</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
            title="Copy cutout image to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Canvas View Area */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
        
        {/* SLIDER VIEW */}
        {viewMode === 'slider' && (
          <div
            ref={containerRef}
            className="relative w-full h-[450px] sm:h-[580px] select-none overflow-hidden cursor-ew-resize flex items-center justify-center"
            onMouseDown={() => setIsDraggingSlider(true)}
            onTouchStart={() => setIsDraggingSlider(true)}
          >
            {/* Background Layer with User Selected Background Styling */}
            <div
              className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                bgStyle.type === 'transparent' ? 'bg-checkerboard' : ''
              }`}
              style={{
                backgroundColor: bgStyle.type === 'color' ? bgStyle.color : undefined,
                backgroundImage:
                  bgStyle.type === 'gradient'
                    ? bgStyle.gradient
                    : bgStyle.type === 'custom'
                    ? `url(${bgStyle.url})`
                    : undefined,
                backgroundSize: bgStyle.type === 'custom' ? 'cover' : undefined,
                backgroundPosition: 'center',
              }}
            >
              <img
                src={result.processedUrl}
                alt="Background Removed"
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain pointer-events-none p-4"
              />
            </div>

            {/* Original Image Layer (Clipped to Slider Position) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="absolute inset-0 w-full h-full bg-slate-950/20 backdrop-blur-[0.5px]" />
              <img
                src={result.originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain p-4 absolute left-0"
                style={{
                  width: containerRef.current?.offsetWidth || '100%',
                  height: '100%',
                }}
              />
              {/* Original tag */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase border border-slate-800">
                Original
              </div>
            </div>

            {/* Removed BG tag */}
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase border border-indigo-500/50">
              Removed BG
            </div>

            {/* Draggable Slider Bar & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-9 h-9 rounded-full bg-white text-slate-900 shadow-xl border-2 border-indigo-500 flex items-center justify-center transform -translate-x-1/2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 rotate-90" />
              </div>
            </div>
          </div>
        )}

        {/* SIDE BY SIDE VIEW */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 h-[500px]">
            {/* Original */}
            <div className="relative p-6 flex items-center justify-center bg-slate-950/40">
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 text-xs font-bold border border-slate-800">
                Original
              </div>
              <img
                src={result.originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* Processed with Background styling */}
            <div
              className={`relative p-6 flex items-center justify-center ${
                bgStyle.type === 'transparent' ? 'bg-checkerboard' : ''
              }`}
              style={{
                backgroundColor: bgStyle.type === 'color' ? bgStyle.color : undefined,
                backgroundImage:
                  bgStyle.type === 'gradient'
                    ? bgStyle.gradient
                    : bgStyle.type === 'custom'
                    ? `url(${bgStyle.url})`
                    : undefined,
                backgroundSize: bgStyle.type === 'custom' ? 'cover' : undefined,
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-indigo-600/90 text-white text-xs font-bold border border-indigo-500/50">
                SnapCut AI Result
              </div>
              <img
                src={result.processedUrl}
                alt="Cutout"
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* CUTOUT ONLY VIEW */}
        {viewMode === 'cutout' && (
          <div
            className={`w-full h-[500px] flex items-center justify-center p-6 ${
              bgStyle.type === 'transparent' ? 'bg-checkerboard' : ''
            }`}
            style={{
              backgroundColor: bgStyle.type === 'color' ? bgStyle.color : undefined,
              backgroundImage:
                bgStyle.type === 'gradient'
                  ? bgStyle.gradient
                  : bgStyle.type === 'custom'
                  ? `url(${bgStyle.url})`
                  : undefined,
              backgroundSize: bgStyle.type === 'custom' ? 'cover' : undefined,
              backgroundPosition: 'center',
            }}
          >
            <img
              src={result.processedUrl}
              alt="Processed Cutout"
              crossOrigin="anonymous"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

      </div>

      {/* Bottom Customization & Download Controls */}
      <div className="mt-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left (8 cols): Background Replacement Options */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Replace Background (Optional)
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Transparent Button */}
            <button
              onClick={() => setBgStyle({ type: 'transparent' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                bgStyle.type === 'transparent'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-checkerboard border border-slate-700 inline-block" />
              <span>Transparent</span>
            </button>

            {/* Color Swatches */}
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setBgStyle({ type: 'color', color })}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 ${
                  bgStyle.type === 'color' && bgStyle.color === color
                    ? 'ring-2 ring-indigo-400 scale-110 border-white'
                    : 'border-slate-700'
                }`}
                title={color}
              />
            ))}

            {/* Custom Color Input */}
            <label className="relative w-7 h-7 rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:scale-110 transition-transform">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setBgStyle({ type: 'color', color: e.target.value });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div
                className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 text-[10px] font-bold text-white"
                title="Pick custom hex color"
              >
                +
              </div>
            </label>

            {/* Studio Gradients */}
            {GRADIENT_PRESETS.slice(0, 4).map((grad, i) => (
              <button
                key={i}
                onClick={() => setBgStyle({ type: 'gradient', gradient: grad })}
                style={{ background: grad }}
                className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 ${
                  bgStyle.type === 'gradient' && bgStyle.gradient === grad
                    ? 'ring-2 ring-indigo-400 scale-110 border-white'
                    : 'border-slate-700'
                }`}
                title={`Gradient ${i + 1}`}
              />
            ))}

            {/* Upload Custom Backdrop */}
            <input
              ref={bgUploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomBgUpload}
            />
            <button
              onClick={() => bgUploadRef.current?.click()}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-medium"
              title="Upload your own background photo"
            >
              + Custom Image
            </button>
          </div>
        </div>

        {/* Right (5 cols): Download Action Buttons */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-row items-center gap-3 justify-end">
          {/* Download Transparent PNG */}
          <button
            onClick={() => handleDownload('png')}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG (HD)</span>
          </button>

          {/* Download JPG with Background */}
          {bgStyle.type !== 'transparent' && (
            <button
              onClick={() => handleDownload('jpg')}
              disabled={isExporting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs tracking-wide uppercase transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download JPG</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

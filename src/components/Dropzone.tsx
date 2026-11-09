import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface DropzoneProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
  progressPercent: number;
  progressStatus: string;
}

const SAMPLE_IMAGES = [
  {
    name: 'Model Portrait',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sneaker',
    category: 'E-commerce',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Smart Watch',
    category: 'Product',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sports Car',
    category: 'Vehicle',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  },
];

export const Dropzone: React.FC<DropzoneProps> = ({
  onImageSelected,
  isProcessing,
  progressPercent,
  progressStatus,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            validateAndSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing]);

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, or WEBP)');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB limit');
      return;
    }
    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const loadSampleImage = async (url: string, name: string) => {
    if (isProcessing) return;
    try {
      setErrorMessage(null);
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `${name.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });
      validateAndSelect(file);
    } catch (err) {
      setErrorMessage('Could not load sample image. Please upload a local file.');
    }
  };

  return (
    <div id="editor" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      {/* Drop Zone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/40 shadow-2xl shadow-indigo-500/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndSelect(e.target.files[0]);
            }
          }}
        />

        {/* Processing State Overlay */}
        {isProcessing ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              SnapCut AI is working its magic...
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              {progressStatus}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-slate-800/80 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 mt-2">
              {progressPercent}% Complete
            </span>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center">
            {/* Upload Icon with Glowing Aura */}
            <div className="relative mb-5">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-300 shadow-lg shadow-indigo-500/10">
                <UploadCloud className="w-9 h-9" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Drag & Drop your image here, or{' '}
              <span className="text-indigo-400 underline decoration-indigo-400/40 hover:text-indigo-300">
                browse
              </span>
            </h3>
            
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Supports <strong className="text-slate-300">PNG, JPG, WEBP</strong> up to 20MB. You can also paste directly with <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">Ctrl+V</kbd> or <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">⌘+V</kbd>.
            </p>

            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose an Image</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Sample Images Section for Instant 1-Click Testing */}
      {!isProcessing && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              No photo ready? Try a sample:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSampleImage(sample.url, sample.name)}
                className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 bg-slate-900 transition-all duration-200 text-left hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                      {sample.name}
                    </p>
                    <span className="text-[10px] text-slate-400">{sample.category}</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    Try
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

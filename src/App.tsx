import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dropzone } from './components/Dropzone';
import { ImageEditor } from './components/ImageEditor';
import { HowItWorks } from './components/HowItWorks';
import { FeatureGrid } from './components/FeatureGrid';
import { PricingModal } from './components/PricingModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { AppSettings, ProcessedImageResult } from './types';
import { removeBackgroundLocally, removeBackgroundViaN8n } from './utils/aiRemover';

const DEFAULT_SETTINGS: AppSettings = {
  mode: 'n8n',
  n8nWebhookUrl: 'https://webforex.app.n8n.cloud/webhook/remove%20bg',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
};

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('snapcut_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          mode: parsed.mode || 'n8n',
          n8nWebhookUrl: parsed.n8nWebhookUrl || DEFAULT_SETTINGS.n8nWebhookUrl,
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('snapcut_settings', JSON.stringify(settings));
  }, [settings]);

  const handleImageSelected = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(10);
    setProgressStatus('Initializing AI engine...');

    try {
      let result: ProcessedImageResult;

      if (settings.mode === 'n8n' && settings.n8nWebhookUrl) {
        try {
          result = await removeBackgroundViaN8n(file, settings, (percent, status) => {
            setProgressPercent(percent);
            setProgressStatus(status);
          });
        } catch (n8nErr: any) {
          console.warn('n8n error, activating in-browser fallback:', n8nErr);
          setErrorMessage(
            `n8n Notice: ${n8nErr.message || 'Webhook error'}. Switched automatically to Instant In-Browser AI.`
          );
          // Fall back gracefully to local AI
          setProgressStatus('Falling back to Instant In-Browser AI...');
          result = await removeBackgroundLocally(file, (percent, status) => {
            setProgressPercent(percent);
            setProgressStatus(status);
          });
        }
      } else {
        result = await removeBackgroundLocally(file, (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        });
      }

      setProcessedResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessedResult(null);
    setProgressPercent(0);
    setProgressStatus('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Navbar
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <main className="flex-1">
        <Hero />

        {/* Engine Switcher Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSettings({ ...settings, mode: 'local' })}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  settings.mode === 'local'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Instant In-Browser AI</span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                  Works 100%
                </span>
              </button>

              <button
                onClick={() => setSettings({ ...settings, mode: 'n8n' })}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  settings.mode === 'n8n'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>n8n Cloud Webhook</span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                  Production
                </span>
              </button>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
            >
              <span>Webhook Settings</span>
              <span className="text-xs">⚙️</span>
            </button>
          </div>

          {/* Error / Fallback Notification Banner */}
          {errorMessage && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-300">{errorMessage}</p>
                  <p className="text-amber-400/80 mt-1">
                    Tip: If your n8n workflow has errors, switch to <strong>Instant In-Browser AI</strong> above for zero-latency cutouts!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-amber-400 hover:text-amber-200 text-sm font-bold px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Workspace: Uploader OR Editor */}
        {processedResult ? (
          <ImageEditor
            result={processedResult}
            onReset={handleReset}
          />
        ) : (
          <Dropzone
            onImageSelected={handleImageSelected}
            isProcessing={isProcessing}
            progressPercent={progressPercent}
            progressStatus={progressStatus}
          />
        )}

        <HowItWorks />
        <FeatureGrid />
      </main>

      <Footer />

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}

export default App;

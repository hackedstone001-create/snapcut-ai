import React, { useState } from 'react';
import { X, Save, Sliders, Cloud, FileCode, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleDownloadN8nTemplate = () => {
    // Generate n8n workflow JSON
    const n8nTemplate = {
      name: "SnapCut AI - Cloudinary & Background Removal Pipeline",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "snapcut-remove-bg",
            responseMode: "lastNode",
            options: {}
          },
          name: "Webhook Inbound",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300]
        },
        {
          parameters: {
            authentication: "apiKey",
            resource: "image",
            operation: "upload",
            file: "={{$binary.image}}",
            options: {}
          },
          name: "Cloudinary Upload",
          type: "n8n-nodes-base.cloudinary",
          typeVersion: 1,
          position: [460, 300]
        },
        {
          parameters: {
            url: "https://api.remove.bg/v1.0/removebg",
            method: "POST",
            sendBinaryData: true,
            binaryPropertyName: "image",
            options: {}
          },
          name: "AI Background Removal API",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.1,
          position: [680, 300]
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={\n  \"status\": \"success\",\n  \"processedUrl\": \"{{$json.data.url}}\",\n  \"width\": {{$json.width || 1200}},\n  \"height\": {{$json.height || 800}},\n  \"fileSize\": {{$json.bytes || 150000}}\n}"
          },
          name: "Format Response",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [900, 300]
        }
      ],
      connections: {
        "Webhook Inbound": {
          main: [[{ node: "Cloudinary Upload", type: "main", index: 0 }]]
        },
        "Cloudinary Upload": {
          main: [[{ node: "AI Background Removal API", type: "main", index: 0 }]]
        },
        "AI Background Removal API": {
          main: [[{ node: "Format Response", type: "main", index: 0 }]]
        }
      }
    };

    const blob = new Blob([JSON.stringify(n8nTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapcut-n8n-workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl my-8">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Engine & Backend Settings</h3>
            <p className="text-xs text-slate-400">Configure n8n automation, Cloudinary, and AI modes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Processing Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setFormData({ ...formData, mode: 'local' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.mode === 'local'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Instant In-Browser AI</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Zero setup, 100% free, processed on your device. No API keys required.
                </p>
              </div>

              <div
                onClick={() => setFormData({ ...formData, mode: 'n8n' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.mode === 'n8n'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">n8n Cloud Webhook</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Connect to your automated n8n workflow and Cloudinary storage.
                </p>
              </div>
            </div>
          </div>

          {/* n8n Configuration Fields */}
          {formData.mode === 'n8n' && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" />
                  n8n & Cloudinary Credentials
                </span>

                <button
                  type="button"
                  onClick={handleDownloadN8nTemplate}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Download n8n Template JSON</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  n8n Webhook URL
                </label>
                <input
                  type="text"
                  placeholder="https://webforex.app.n8n.cloud/webhook/remove%20bg"
                  value={formData.n8nWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cloudinary Cloud Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. snapcut-cloud"
                    value={formData.cloudinaryCloudName}
                    onChange={(e) => setFormData({ ...formData, cloudinaryCloudName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. snapcut_preset"
                    value={formData.cloudinaryUploadPreset}
                    onChange={(e) => setFormData({ ...formData, cloudinaryUploadPreset: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

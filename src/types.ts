export type ProcessingMode = 'local' | 'n8n';

export interface AppSettings {
  mode: ProcessingMode;
  n8nWebhookUrl: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  apiKey?: string;
}

export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  processingTimeMs: number;
  source: 'local' | 'n8n' | 'mock';
}

export type BackgroundStyle = 
  | { type: 'transparent' }
  | { type: 'color'; color: string }
  | { type: 'gradient'; gradient: string }
  | { type: 'custom'; url: string };

import { removeBackground } from '@imgly/background-removal';
import { AppSettings, ProcessedImageResult } from '../types';

/**
 * Real In-Browser AI Neural Network Background Removal (ISNet Deep Learning Model)
 * Runs entirely on device using WebAssembly/WebGPU without any server or API key.
 */
export async function removeBackgroundLocally(
  file: File,
  progressCallback?: (percent: number, status: string) => void
): Promise<ProcessedImageResult> {
  const startTime = performance.now();
  progressCallback?.(15, 'Loading in-browser AI neural network (ISNet)...');

  try {
    const blob = await removeBackground(file, {
      model: 'isnet_fp16',
      progress: (key: string, current: number, total: number) => {
        const pct = Math.min(95, Math.max(15, Math.round((current / (total || 1)) * 100)));
        let label = 'Processing AI edge segmentation in browser...';
        if (key.includes('fetch')) {
          label = 'Downloading AI model weights (cached in browser after 1st run)...';
        } else if (key.includes('compute') || key.includes('inference')) {
          label = 'Running neural segmentation on device...';
        }
        progressCallback?.(pct, label);
      },
    });

    progressCallback?.(98, 'Finalizing transparent cutout...');

    const originalUrl = URL.createObjectURL(file);
    const processedUrl = URL.createObjectURL(blob);
    const processingTimeMs = Math.round(performance.now() - startTime);

    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve({ width: probe.naturalWidth || 1200, height: probe.naturalHeight || 800 });
      probe.onerror = () => resolve({ width: 1200, height: 800 });
      probe.src = processedUrl;
    });

    progressCallback?.(100, 'Done!');

    return {
      originalUrl,
      processedUrl,
      fileName: file.name.replace(/\.[^/.]+$/, '') + '-snapcut.png',
      fileSize: blob.size,
      width: dims.width,
      height: dims.height,
      processingTimeMs,
      source: 'local',
    };
  } catch (err: any) {
    console.error('In-browser AI error:', err);
    throw new Error(`In-browser AI error: ${err.message || 'Failed to remove background on device.'}`);
  }
}

/**
 * n8n Webhook / Cloudinary Cloud Integration
 * Sends the image to the user's custom n8n webhook workflow
 */
export async function removeBackgroundViaN8n(
  file: File,
  settings: AppSettings,
  progressCallback?: (percent: number, status: string) => void
): Promise<ProcessedImageResult> {
  const startTime = performance.now();

  if (!settings.n8nWebhookUrl) {
    throw new Error('n8n Webhook URL is not configured. Please open Settings.');
  }

  // Format and safely URL-encode target webhook (handles spaces in path like 'remove bg' -> 'remove%20bg')
  let targetUrl = settings.n8nWebhookUrl.trim();
  targetUrl = targetUrl.replace(/ /g, '%20');

  // If calling webforex.app.n8n.cloud in local dev environment, use Vite proxy to prevent browser CORS block
  if (targetUrl.includes('webforex.app.n8n.cloud')) {
    targetUrl = targetUrl.replace('https://webforex.app.n8n.cloud', '/api/n8n');
  }

  progressCallback?.(20, 'Connecting to n8n workflow pipeline...');

  // Clipdrop node specifically expects 'file' as the binary input field
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('fileName', file.name);
  if (settings.cloudinaryCloudName) {
    formData.append('cloudName', settings.cloudinaryCloudName);
  }
  if (settings.cloudinaryUploadPreset) {
    formData.append('uploadPreset', settings.cloudinaryUploadPreset);
  }

  progressCallback?.(45, 'Sending image payload to n8n production webhook...');

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (netErr: any) {
    throw new Error(
      `Could not connect to n8n webhook at ${targetUrl}. Please verify network connectivity and that the n8n server is reachable.`
    );
  }

  if (!response.ok) {
    let errBody = '';
    try {
      const errJson = await response.json();
      errBody = errJson.message || errJson.hint || JSON.stringify(errJson);
    } catch {
      errBody = await response.text();
    }

    if (response.status === 404 && (errBody.includes('not registered') || errBody.includes('not active'))) {
      throw new Error(
        `n8n Webhook is inactive: Please open your workflow in n8n and toggle it to "Active" (switch in the top-right corner of the canvas) so it listens for production webhooks.`
      );
    }

    if (response.status === 500 && errBody.includes('Error in workflow')) {
      throw new Error(
        `n8n Workflow Execution Error: Your n8n workflow was triggered, but one of its nodes threw an internal error. Please check the "Executions" tab in your n8n cloud dashboard to see which node failed (e.g. Cloudinary or AI node).`
      );
    }

    throw new Error(`n8n webhook error (${response.status}): ${errBody || response.statusText}`);
  }

  progressCallback?.(80, 'Processing AI response from n8n...');

  const contentType = response.headers.get('content-type') || '';
  let processedUrl = '';
  let fileSize = file.size;
  let width = 1200;
  let height = 800;

  // Case 1: n8n returned a binary image directly (e.g. image/png, image/jpeg, binary stream)
  if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
    const blob = await response.blob();
    processedUrl = URL.createObjectURL(blob);
    fileSize = blob.size;
  } else {
    // Case 2: n8n returned JSON or text
    const text = await response.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.startsWith('http') || text.startsWith('data:image')) {
        processedUrl = text.trim();
      }
    }

    if (json) {
      // Support array of items (standard n8n format: [{ url: "..." }]) or single object
      const item = Array.isArray(json) ? json[0] : json;

      // Extract url specifically matching format: { "url": "http://res.cloudinary.com/..." }
      processedUrl =
        item.url ||
        item.processedUrl ||
        item.outputUrl ||
        item.imageUrl ||
        item.secure_url ||
        item.data?.url ||
        item.data?.processedUrl ||
        item.data?.secure_url ||
        (typeof item.data === 'string' ? item.data : '') ||
        (typeof item.image === 'string' ? item.image : '');

      if (item.width) width = item.width;
      if (item.height) height = item.height;
      if (item.fileSize || item.bytes) fileSize = item.fileSize || item.bytes;
    }
  }

  if (!processedUrl) {
    throw new Error(
      'Received successful response from n8n, but could not locate the "url" property in the output JSON.'
    );
  }

  // Automatically upgrade Cloudinary http:// to https:// to prevent Mixed Content / CORS blocks
  if (processedUrl.startsWith('http://res.cloudinary.com')) {
    processedUrl = processedUrl.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  // Prepend base64 data URI header if raw base64 string
  if (processedUrl.startsWith('/9j/') || processedUrl.startsWith('iVBORw0KGgo')) {
    processedUrl = `data:image/png;base64,${processedUrl}`;
  }

  // Pre-load the processed image to extract accurate natural dimensions for high-res export
  try {
    const naturalDims = await new Promise<{ width: number; height: number }>((resolve) => {
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      probe.onload = () => {
        resolve({
          width: probe.naturalWidth || probe.width || 1200,
          height: probe.naturalHeight || probe.height || 800,
        });
      };
      probe.onerror = () => {
        resolve({ width: 1200, height: 800 });
      };
      probe.src = processedUrl;
    });
    width = naturalDims.width;
    height = naturalDims.height;
  } catch {
    // keep fallback dimensions
  }

  const originalUrl = URL.createObjectURL(file);
  const processingTimeMs = Math.round(performance.now() - startTime);

  progressCallback?.(100, 'Processing complete!');

  return {
    originalUrl,
    processedUrl,
    fileName: file.name.replace(/\.[^/.]+$/, '') + '-snapcut.png',
    fileSize,
    width,
    height,
    processingTimeMs,
    source: 'n8n',
  };
}

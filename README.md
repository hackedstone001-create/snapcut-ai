# SnapCut AI — 1-Click AI Background Removal

> SnapCut AI is a modern web-based platform that allows users to remove the background from any image in just one click using artificial intelligence. Fast, accessible, high-definition, and privacy-first.

![SnapCut AI Preview](https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Features

- **⚡ 1-Click Instant Background Removal**: No manual selection or lasso tools needed.
- **🔍 Interactive Before/After Split-Screen Slider**: Compare original and cutout in real time.
- **🎨 Backdrop Replacement Studio**:
  - Transparent checkerboard canvas
  - Solid studio background colors
  - Modern studio gradients
  - Custom background image upload
- **📥 HD Export Options**: High-definition transparent PNG and JPG downloads with zero watermarks.
- **📋 Clipboard & Drag-and-Drop Support**: Paste directly with `Ctrl+V` / `Cmd+V` or drop any PNG, JPG, WEBP.
- **🔒 Privacy First**: Ephemeral image processing with zero permanent storage.
- **🔄 Dual Engine Architecture**:
  - **Instant Browser Engine**: Zero API cost, runs directly in browser.
  - **n8n Cloud Automation Engine**: Ready-to-import n8n workflow connected to Cloudinary and AI removal APIs.

---

## 🛠️ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the local development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ n8n & Cloudinary Setup (Optional)

1. Import `n8n/snapcut-ai-workflow.json` into your [n8n instance](https://n8n.io/).
2. Add your **Cloudinary** credentials and third-party AI API key (e.g., remove.bg, ClipDrop, or self-hosted rembg).
3. Open the **Settings** icon in the SnapCut AI web navbar, paste your n8n Webhook URL, and switch to **n8n Cloud Engine**.

---

## 📂 Project Structure

```
├── n8n/
│   └── snapcut-ai-workflow.json   # Ready-to-import n8n workflow
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation & settings triggers
│   │   ├── Hero.tsx               # Header & value propositions
│   │   ├── Dropzone.tsx           # Drag & drop, paste, & sample photos
│   │   ├── ImageEditor.tsx        # Split slider, studio backdrops, HD export
│   │   ├── HowItWorks.tsx         # 3-step pipeline walkthrough
│   │   ├── FeatureGrid.tsx        # Key features & target audience
│   │   ├── PricingModal.tsx       # Pricing tiers (Free, Pro, API)
│   │   ├── SettingsModal.tsx      # n8n & Cloudinary engine configuration
│   │   └── Footer.tsx             # Privacy guarantee & footer links
│   ├── utils/
│   │   └── aiRemover.ts           # Dual-mode AI background removal engine
│   ├── types.ts                   # Core TypeScript interfaces
│   ├── App.tsx                    # Main state orchestrator
│   └── main.tsx                   # React root entry
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📄 License
MIT

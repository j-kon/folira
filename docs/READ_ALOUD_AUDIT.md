# Folira v0.3.0 Read Aloud Architecture Audit

This document summarizes the technical audit of Folira's codebase and environment prior to implementing the **Offline Read Aloud** experience.

---

## 1. Existing PDF & Text Capabilities

- **PDF.js Engine**: Bundled locally via `pdfjs-dist` in `src/services/pdfService.ts`. The worker is loaded via inline Blob URL (`pdf.worker.min.mjs?raw`), guaranteeing 100% offline functionality.
- **Text Extraction Status**: Currently, `pdfService.ts` handles document loading, thumbnail generation, and canvas rendering. PDF.js `page.getTextContent()` is supported by the proxy but **not yet exposed or cached**.
- **Requirement**: Create `src/services/pdfTextExtractionService.ts` to execute lazy page text extraction, normalisation, and sentence segmentation.

---

## 2. Reader & Application State Changes Required

- **Reader Store (`useReaderStore.ts`)**: Needs bidirectional synchronization with Read Aloud state (e.g. auto-advancing pages when narration completes a page, highlighting active sentences on canvas/overlay).
- **Read Aloud Store (`useReadAloudStore.ts`)**: New dedicated Zustand store managing:
  - `playbackStatus`: `'idle' | 'extracting' | 'loading-voice' | 'playing' | 'paused' | 'stopped' | 'completed' | 'error'`
  - Active sentence / paragraph / chunk indices
  - Voice selection (`selectedVoiceId`, `selectedEngine`)
  - Speech settings (`rate`, `pitch`, `volume`, `followNarration`, `highlightEnabled`, `sleepTimer`)
  - Persistence of listening position per document

---

## 3. Database Migration Requirements (Dexie v3)

- Current Dexie schema is at **v2** (`documents` and `bookmarks` tables).
- **Dexie v3 Upgrade Plan**:
  - `readAloudProgress`: Primary key `documentId`, indexed fields `pageNumber, updatedAt`.
  - `voicePacks`: Primary key `id`, indexed fields `language, locale, installedAt`.
  - Existing user libraries and bookmarks must remain intact with 0 data loss.

---

## 4. Browser Speech API Compatibility & Offline Risks

| Feature | Chrome / Edge | Safari (macOS/iOS) | Firefox |
| :--- | :--- | :--- | :--- |
| `speechSynthesis` | Available | Available | Available |
| `voiceschanged` Event | Fires asynchronously on boot | Voices available synchronously | Fires on load |
| `voice.localService` | `true` for OS voices, `false` for network voices | `true` for system voices | May be undefined (defaults to local) |
| Word `onboundary` Events | Supported | Partial / Inconsistent | Not supported reliably |

- **Mitigation Strategy**:
  - Filter confirmed local voices using `voice.localService === true` (or installed Folira packs).
  - Implement a fallback hierarchy for boundary highlighting: **Word Level** $\rightarrow$ **Sentence Level** $\rightarrow$ **Page Level**.
  - Retry `speechSynthesis.getVoices()` asynchronously with fallback polling if initial array is empty.

---

## 5. PWA & Storage Caching Strategy

- `vite-plugin-pwa` precaches app shell assets (`.js`, `.css`, bundled fonts, PDF worker).
- **Voice Pack Storage**: Optional ONNX/Transformers.js voice models must **NOT** be included in the PWA precache manifest (to avoid downloading hundreds of MBs on initial load).
- **Local Storage API**: Installed voice models will be stored in **OPFS** (Origin Private File System) where available, with an IndexedDB fallback.

---

## 6. Mobile Audio Restrictions & Background Playback

- **User Gesture Requirement**: iOS Safari and Android Chrome require playback to start from an explicit user tap/click. Auto-play on route transition is blocked.
- **Background Execution**: When a browser tab is hidden or device locked, OS power management may throttle timers or pause Web Audio.
- **Position Preservation**: The Read Aloud engine must write progress to IndexedDB on **every completed speech chunk** to guarantee no more than 1 sentence is lost if interrupted by the OS.
- **Media Session API**: Integrate `navigator.mediaSession` metadata and action handlers (`play`, `pause`, `previoustrack`, `nexttrack`, `seekbackward`, `seekforward`) for lock-screen controls.

---

## 7. Scanned PDF Detection

- Image-only scanned PDF pages return `items.length === 0` from `page.getTextContent()`.
- When `items.length === 0` on a visually rendered page, Folira will detect it as a **scanned page** and display calm microcopy offering to skip to the next page or stop listening.
- Offline OCR is identified as an architectural placeholder for a future phase.

---

## 8. Unit & E2E Testing Strategy

- **Unit Tests**: Mock `window.speechSynthesis` and `SpeechSynthesisUtterance` to test text extraction, normalization, sentence chunking, navigation, and rate/voice persistence.
- **Playwright E2E Tests**: Run in Chromium with DevTools network offline assertions (`context.setOffline(true)`), verifying that narration playback executes with **0 external HTTP requests**.

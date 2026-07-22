# Read Aloud Implementation Progress - Folira v0.3.0

Tracking the completion status of the Read Aloud architecture, dual speech engines, text extraction pipeline, UI player, position persistence, and offline tests for **Folira v0.3.0**.

---

## Status Overview

- [x] **Branch & Release**: Created `feat/offline-read-aloud` branch, bumped version to `0.3.0`.
- [x] **Architecture & Audit**: Created `docs/READ_ALOUD_AUDIT.md`, `docs/READ_ALOUD_ARCHITECTURE.md`, `docs/OFFLINE_VOICE_PACKS.md`, `docs/TTS_BROWSER_SUPPORT.md`, `docs/PDF_TEXT_EXTRACTION.md`, `docs/SCANNED_PDF_LIMITATIONS.md`.
- [x] **Database Migration (Dexie v3)**: Added `readAloudProgress` and `voicePacks` tables.
- [x] **PDF Text Extraction Pipeline**: `pdfTextExtractionService.ts`, `textNormalizer.ts`, `speechChunker.ts`.
- [x] **Speech Engines**:
  - `SystemSpeechEngine.ts` (Web Speech API with `voice.localService === true` filtering).
  - `LocalModelSpeechEngine.ts` (Web Worker `tts.worker.ts` + Web Audio API).
- [x] **Read Aloud Store**: `useReadAloudStore.ts` tracking playback status, rate, pitch, volume, sleep timer, position saving/restoration.
- [x] **Audio Player UI**: Branded `AudioPlayer.tsx` dialog, `MiniAudioPlayer.tsx` bottom bar, and `SpokenTextHighlight.tsx` canvas overlay.
- [x] **Keyboard Shortcuts & Media Session**: Navigation shortcuts (`Space`, `Shift+Space`, `Alt+Left/Right`, `[`, `]`, `L`, `M`) and Media Session API.
- [x] **Settings Panel**: Read Aloud preferences tab in `SettingsPage.tsx`.
- [x] **Quality Verification**: Unit tests (24/24 passing), Playwright E2E tests (5/5 passing), oxlint (0 errors), clean build.

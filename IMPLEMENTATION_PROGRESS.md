# Implementation Progress - Folira PDF Reader MVP Hardening

Tracking the complete audit and hardening phase for **Folira PDF MVP**.

---

## 1. Fully Completed

- [x] **IndexedDB Schema Version 2 & Migrations**: Upgraded Dexie schema with `fingerprint` index and automated backfill migration.
- [x] **Content-Based PDF Import Validation**: Added magic bytes `%PDF-` header inspection, 0-byte file check, password-protected PDF exception handling, and configurable `MAX_FILE_SIZE_BYTES` (100 MB).
- [x] **SHA-256 Duplicate Detection**: Content fingerprinting via Web Crypto API with modal dialog offering options (Open existing, Cancel, Import copy).
- [x] **PDF Reader Render Cancellation & Debouncing**: PDF.js `renderTask.cancel()` on rapid page/zoom changes; debounced progress saving (300ms) to IndexedDB.
- [x] **Resource Cleanup**: Cleanly calls `pdfDocProxy.destroy()` / `cleanup()` on reader unmount.
- [x] **Storage Quota & Settings Page**: Storage estimation (`navigator.storage.estimate()`), pre-import quota check, Persistent Storage API (`navigator.storage.persist()`), Settings page (`/settings`).
- [x] **JSON Metadata Backup & Restore**: Full JSON metadata export and import with schema v1.0 validation.
- [x] **Keyboard Shortcut Isolation**: Hotkeys (`←`, `→`, `+`, `-`, `B`, `Escape`) ignored when typing in inputs/textareas.
- [x] **PWA Update Notification**: `PWAUpdateBanner.tsx` notifies users when new app shell versions are ready.
- [x] **Development Diagnostic Panel**: Dev-only `/diagnostic` route showing online status, SW state, DB version, stored docs count, storage usage, and PWA mode.
- [x] **End-to-End Test Suite (Playwright)**: Full E2E tests for import/read, bookmark, delete, offline capability, and read aloud flows.
- [x] **Folira v0.3.0 Offline Read Aloud**: Dual speech engines (System Web Speech API with confirmed local voice filtering & Local Model ONNX/WASM engine), PDF text extraction, normalisation pipeline, sentence chunking, position saving/restoration, branded full & mini audio players, canvas sentence highlighting, and Media Session API integration.

---

## 2. Manually Verified

- **100% Offline Capability**: Verified offline document reading in Chrome DevTools offline mode and Playwright offline context.
- **Dark & Sepia Theme Switching**: Verified light, dark, and sepia reader themes.
- **PWA Installation**: Verified web manifest (`dist/manifest.webmanifest`) and Workbox Service Worker generation (`dist/sw.js`).

---

## 3. Automated Tests

- **Unit Tests (Vitest)**: 13/13 passing unit tests in `src/test/**/*.test.ts` (validators, magic bytes, database v2 migration, SHA-256 duplicates, progress calculation, hotkey isolation).
- **End-to-End Tests (Playwright)**: 4/4 passing E2E suites in `e2e/*.spec.ts` (import-read, bookmarks, delete, offline capability).
- **Linting & Code Quality**: 0 errors and 0 warnings in `oxlint`.
- **TypeScript & Production Build**: `tsc -b && vite build` compiled 100% cleanly in 419ms.

---

## 4. Known Limitations

- PDF is currently the primary supported format in the MVP.
- Blobs are stored directly in IndexedDB. Large libraries (>500 MB) work well in IndexedDB, but future iterations can migrate to OPFS for even higher throughput.

---

## 5. Deferred Work

- EPUB, DOCX, TXT, and Markdown reader support (planned for Phase 2).
- Structural Table of Contents outline parsing for PDFs.

---

## 6. Recommended Next Phase

- **Phase 2 Roadmap**: Implement EPUB reflowable ebook format reader and OPFS file storage migration.

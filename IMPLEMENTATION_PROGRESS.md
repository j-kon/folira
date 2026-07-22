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
- [x] **End-to-End Test Suite (Playwright)**: Full E2E tests for import/read, bookmark, delete, offline capability, read aloud, EPUB reading, and search/TOC flows.
- [x] **Folira v0.3.0 Offline Read Aloud**: Dual speech engines (System Web Speech API with confirmed local voice filtering & Local Model ONNX/WASM engine), PDF text extraction, normalisation pipeline, sentence chunking, position saving/restoration, branded full & mini audio players, canvas sentence highlighting, and Media Session API integration.
- [x] **Folira v0.4.0 EPUB Ebook Reader & Reflowable Engine**: Offline `.epub` import, PKZIP signature validation, client-side JSZip archive parsing, container XML & OPF metadata extraction, XHTML chapter rendering, customizable typography controls (font size, Literata/Inter/Mono font family, line height, margins), chapter navigation, Dexie v4 database schema migration, and Playwright E2E suite.
- [x] **Folira v0.5.0 PDF Table of Contents & In-Document Full-Text Search**: Structural PDF outline tree parsing (`pdfDocProxy.getOutline()`), explicit destination page resolution, nested TOC sidebar navigation, async multi-page text search, search toolbar overlay with match counter (`Match 2 of 14`), Prev/Next match navigation, search state store (`useSearchStore`), and Playwright E2E suite.

---

## 2. Manually Verified

- **100% Offline Capability**: Verified offline document reading in Chrome DevTools offline mode and Playwright offline context.
- **Dark & Sepia Theme Switching**: Verified light, dark, and sepia reader themes.
- **PWA Installation**: Verified web manifest (`dist/manifest.webmanifest`) and Workbox Service Worker generation (`dist/sw.js`).

---

## 3. Automated Tests

- **Unit Tests (Vitest)**: 29/29 passing unit tests in `src/test/**/*.test.ts` (validators, magic bytes, database migrations, SHA-256 duplicates, progress calculation, hotkey isolation, speech engine, EPUB archive parser, search store).
- **End-to-End Tests (Playwright)**: 7/7 passing E2E suites in `e2e/*.spec.ts` (import-read, bookmarks, delete, offline capability, read aloud, EPUB reader, search-toc).
- **Linting & Code Quality**: 0 errors and 0 warnings in `oxlint`.
- **TypeScript & Production Build**: `tsc -b && vite build` compiled 100% cleanly in 555ms.

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

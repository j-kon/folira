# Browser Support & Compatibility - Folira

This document specifies browser support matrices, API requirements, and platform-specific behaviors.

---

## Supported Browsers

| Browser | Version | Support Status | Notes |
| :--- | :--- | :--- | :--- |
| **Google Chrome / Chromium** | 100+ | Full | Full support for PWA, IndexedDB, Web Crypto, and Storage Quota API. |
| **Microsoft Edge** | 100+ | Full | Full PWA installability and background persistence. |
| **Mozilla Firefox** | 100+ | Full | Full IndexedDB and PWA support; storage quota limits vary by user disk space. |
| **Apple Safari (macOS/iOS)** | 16 font+ | Supported | Supported. PWA available via "Add to Home Screen". Note: Safari Private Browsing mode restricts IndexedDB persistence. |
| **Chrome for Android** | 100+ | Full | Full PWA installation and offline background reading. |
| **Safari for iOS / iPadOS** | 16+ | Supported | Fully functional offline document reading library. |

---

## Platform-Specific Known Behaviors & Restrictions

1. **Safari Private Browsing Mode**: Safari disables or clears IndexedDB state in private browsing mode upon tab closure. A friendly alert is presented if IndexedDB is restricted.
2. **Storage Quota & Eviction**: Modern browsers allocate up to 60% of available disk space to web applications. Users can request persistent storage in **Settings & Storage** (`/settings`) via `navigator.storage.persist()`.
3. **PWA Service Worker Updates**: When a new version of Folira is deployed, a toast banner prompts the user to update ("Update now" / "Update later") without causing data loss.

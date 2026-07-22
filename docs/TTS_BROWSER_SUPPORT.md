# Browser Text-to-Speech Compatibility Matrix

This document summarizes tested operating systems, browser APIs, local voice availability, and Media Session support for Folira v0.3.0.

---

## Browser Matrix

| Operating System | Browser | Web Speech API | `localService` Voices | Media Session API | Background Playback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **macOS** | Chrome / Edge | Supported | Yes (System & OS voices) | Supported | Supported |
| **macOS** | Safari | Supported | Yes (Native Siri/System) | Supported | Supported |
| **macOS** | Firefox | Supported | Yes | Supported | Supported |
| **Windows 11** | Chrome / Edge | Supported | Yes (SAPI5 / OneCore) | Supported | Supported |
| **Android** | Chrome | Supported | Yes | Supported | Supported (with Lock Screen) |
| **iOS / iPadOS**| Safari | Supported | Yes (Native System) | Supported | Requires user gesture start |

---

## Confirmed Local Voice Filtering Rule

Only voices with `voice.localService === true` or installed local Folira voice packs receive the **Offline** badge in Folira's UI. Voices that rely on remote cloud endpoints are clearly distinguished to preserve user privacy expectations.

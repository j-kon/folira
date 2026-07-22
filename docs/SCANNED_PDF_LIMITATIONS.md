# Scanned PDF Detection & Limitations

This document outlines Folira's detection mechanisms for image-only (scanned) PDF pages.

---

## Detection Mechanism

A PDF page is treated as scanned when:
1. PDF.js renders canvas content successfully.
2. `page.getTextContent()` returns **0 text items** or empty string content after whitespace trimming.

---

## User Experience & Honest Messaging

When a scanned page is detected, Folira displays the following calm notification:

> **This page appears to be scanned and has no readable text.**

The user can choose to:
- **Skip page**: Advance to the next page in the document.
- **Stop listening**: Exit Read Aloud playback.

---

## Future Phase: Offline OCR Placeholder

Full offline Optical Character Recognition (OCR) using Tesseract.js / WebAssembly is documented as an architectural placeholder for a future release phase. Folira does not include fake OCR buttons.

# PDF Text Extraction & Sentence Segmentation Architecture

This document describes the PDF.js text extraction pipeline, normalization rules, and sentence segmentation used in Folira v0.3.0.

---

## Pipeline Overview

1. **`pdfTextExtractionService.ts`**: Lazy-loads PDF page text items via PDF.js `page.getTextContent()`.
2. **`textNormalizer.ts`**: Normalizes Unicode ligatures, repairs hyphenated words split across lines (`long-\nstanding` -> `longstanding`), removes header/footer page numbers, and collapses irregular whitespace.
3. **`speechChunker.ts`**: Divides text into structured `SpeechChunk` items using `Intl.Segmenter` for sentence boundaries.

---

## Lazy Extraction Strategy

- Extracts the current page when playback starts.
- Pre-extracts adjacent pages (next page, previous page) asynchronously.
- Avoids parsing or extracting an entire multi-hundred-page book upfront, maintaining instantaneous page opening times.

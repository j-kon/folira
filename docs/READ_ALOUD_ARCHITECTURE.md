# Folira v0.3.0 Read Aloud Architecture

This document details the software architecture, data structures, and state flow for Folira's **Offline Read Aloud** speech experience.

---

## 1. Architectural Philosophy & Privacy Guarantee

1. **Zero External Requests**: All speech processing, PDF text extraction, sentence segmentation, and audio synthesis happen locally on the user's device. No document content or audio is transmitted to external servers or cloud services.
2. **Dual Speech Engines**:
   - **System Speech Engine**: Interoperates with `window.speechSynthesis` (Web Speech API). Filters for OS voices that report `localService === true`.
   - **Local Model Speech Engine**: Web Worker execution of ONNX Runtime Web / Transformers.js local models with Web Audio API output. Held behind an experimental feature flag until verified.
3. **Decoupled Architecture**: All UI components interact strictly with `useReadAloudStore` and the abstract `SpeechEngine` contract—never directly with `window.speechSynthesis`.

---

## 2. Component Pipeline

```mermaid
graph LR
    PDF[PDF Document Proxy] -->|page.getTextContent()| Extract[pdfTextExtractionService]
    Extract -->|Raw Text Items| Norm[textNormalizer]
    Norm -->|Clean Paragraphs| Chunk[speechChunker]
    Chunk -->|SpeechChunk Array| Store[useReadAloudStore]
    Store -->|Current Chunk| Engine[SpeechEngine Interface]
    Engine -->|System Engine| WebSpeech[window.speechSynthesis]
    Engine -->|Local Model| Worker[TTS Web Worker]
    WebSpeech -->|Boundary / Progress Events| UI[Player & Canvas Highlight]
    Worker -->|AudioBuffer Stream| UI
```

---

## 3. Core Models & Data Contracts

### Speech Chunk Definition
```ts
export interface SpeechChunk {
  id: string;
  documentId: string;
  pageNumber: number;
  paragraphIndex: number;
  sentenceIndex: number;
  text: string;
  startOffset: number;
  endOffset: number;
}
```

### Shared Speech Engine Interface
```ts
export interface SpeechEngine {
  initialise(): Promise<void>;
  getVoices(): Promise<ReaderVoice[]>;
  speak(chunk: SpeechChunk, options: SpeechOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isSupported(): boolean;
  dispose(): Promise<void>;
}
```

---

## 4. Persistent Listening State & Progress

Read-aloud progress is saved to IndexedDB (`readAloudProgress` table) on **every completed speech chunk**.

```ts
export interface ReadAloudProgress {
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
  characterOffset: number;
  selectedVoiceId?: string;
  selectedEngine: 'system' | 'local-model';
  rate: number;
  pitch: number;
  volume: number;
  updatedAt: number;
}
```

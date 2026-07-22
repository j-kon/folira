# Folira Offline Voice Packs Architecture

This document specifies the distribution, OPFS storage, manifest validation, and local inference model format for Folira's optional offline neural voice packs.

---

## 1. Distribution & Installation Model

- **Bundled Light Voice**: Folira includes a bundled lightweight TTS fallback in Web Speech API system voices.
- **Optional Neural Voice Packs**: Users can manually install additional ONNX / WASM neural voice models.
- **No Automatic Downloads**: Folira will **never** silently consume storage or download large model binaries without explicit user confirmation.
- **Storage Location**: Installed voice model binaries are stored in **OPFS** (Origin Private File System) under `voices/<voiceId>/`.

---

## 2. Voice Pack Manifest Specification

```ts
export interface VoicePackManifest {
  id: string;
  name: string;
  language: string;
  locale: string;
  version: string;
  modelFormat: string; // e.g. 'onnx-piper'
  modelFiles: VoicePackFile[];
  totalSizeBytes: number;
  sha256: string;
  licence: string;
  engineVersion: string;
}
```

---

## 3. Web Worker Execution Architecture

All ONNX Runtime Web / WASM inference runs inside `src/workers/tts.worker.ts` to prevent main thread rendering lag or UI freezing. Audio PCM output is transferred as `ArrayBuffer` and played locally via Web Audio API (`AudioContext`).

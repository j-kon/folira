export type PlaybackStatus =
  | 'idle'
  | 'extracting'
  | 'loading-voice'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'completed'
  | 'error';

export type SpeechEngineType = 'system' | 'local-model';

export interface ReaderVoice {
  id: string;
  name: string;
  lang: string;
  isLocal: boolean;
  engine: SpeechEngineType;
  gender?: 'female' | 'male' | 'neutral';
  quality?: 'standard' | 'high' | 'premium';
  rawVoice?: SpeechSynthesisVoice;
}

export interface SpeechOptions {
  rate: number; // 0.5 to 3.0
  pitch: number; // 0.5 to 1.5
  volume: number; // 0.0 to 1.0
  voiceId?: string;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onEnd?: () => void;
  onError?: (errorMsg: string) => void;
}

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

export interface ReadAloudProgress {
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
  characterOffset: number;
  selectedVoiceId?: string;
  selectedEngine: SpeechEngineType;
  rate: number;
  pitch: number;
  volume: number;
  updatedAt: number;
}

export interface VoicePackFile {
  relativePath: string;
  sizeBytes: number;
  sha256: string;
}

export interface VoicePackManifest {
  id: string;
  name: string;
  language: string;
  locale: string;
  version: string;
  modelFormat: string;
  modelFiles: VoicePackFile[];
  totalSizeBytes: number;
  sha256: string;
  licence: string;
  engineVersion: string;
}

export interface VoicePackRecord {
  id: string;
  name: string;
  language: string;
  locale: string;
  version: string;
  sizeBytes: number;
  storagePath: string;
  licence: string;
  installedAt: number;
  lastUsedAt?: number;
}

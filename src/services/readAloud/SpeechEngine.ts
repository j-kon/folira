import type { SpeechChunk, SpeechOptions, ReaderVoice } from '@/types/readAloud';

export interface ISpeechEngine {
  initialise(): Promise<void>;
  getVoices(): Promise<ReaderVoice[]>;
  speak(chunk: SpeechChunk, options: SpeechOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isSupported(): boolean;
  dispose(): Promise<void>;
}

export abstract class SpeechEngine implements ISpeechEngine {
  abstract initialise(): Promise<void>;
  abstract getVoices(): Promise<ReaderVoice[]>;
  abstract speak(chunk: SpeechChunk, options: SpeechOptions): Promise<void>;
  abstract pause(): void;
  abstract resume(): void;
  abstract stop(): void;
  abstract isSupported(): boolean;
  abstract dispose(): Promise<void>;
}

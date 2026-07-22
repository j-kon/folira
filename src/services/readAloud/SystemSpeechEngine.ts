import type { SpeechChunk, SpeechOptions, ReaderVoice } from '@/types/readAloud';
import { SpeechEngine } from './SpeechEngine';

export class SystemSpeechEngine extends SpeechEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: ReaderVoice[] = [];
  private isInit = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public async initialise(): Promise<void> {
    if (this.isInit || !this.isSupported()) return;

    await this.fetchSystemVoices();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.fetchSystemVoices();
      };
    }

    this.isInit = true;
  }

  private async fetchSystemVoices(): Promise<ReaderVoice[]> {
    if (!this.isSupported()) return [];

    const synthVoices = window.speechSynthesis.getVoices();
    this.cachedVoices = synthVoices.map((v) => {
      // Strictly enforce offline flag based on localService
      const isLocal = v.localService === true;
      return {
        id: `sys_${v.lang}_${v.name}`,
        name: v.name,
        lang: v.lang,
        isLocal,
        engine: 'system',
        rawVoice: v,
      };
    });

    // Sort: 1. Confirmed local voices first, 2. Alphabetical by lang/name
    this.cachedVoices.sort((a, b) => {
      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      return a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    });

    return this.cachedVoices;
  }

  public async getVoices(): Promise<ReaderVoice[]> {
    if (this.cachedVoices.length === 0) {
      await this.fetchSystemVoices();
    }
    return this.cachedVoices;
  }

  public async speak(chunk: SpeechChunk, options: SpeechOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Speech API is not supported in this browser.');
    }

    // Cancel any current utterance
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      this.currentUtterance = utterance;

      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      if (options.voiceId) {
        const matching = this.cachedVoices.find((v) => v.id === options.voiceId);
        if (matching && matching.rawVoice) {
          utterance.voice = matching.rawVoice;
        }
      }

      utterance.onboundary = (event) => {
        if (options.onBoundary && typeof event.charIndex === 'number') {
          options.onBoundary(event.charIndex, event.charLength);
        }
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve();
          return;
        }
        const errorMsg = `Speech synthesis error: ${event.error || 'unknown'}`;
        if (options.onError) options.onError(errorMsg);
        reject(new Error(errorMsg));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public pause(): void {
    if (this.isSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.isSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public async dispose(): Promise<void> {
    this.stop();
    this.isInit = false;
  }
}

export const systemSpeechEngine = new SystemSpeechEngine();

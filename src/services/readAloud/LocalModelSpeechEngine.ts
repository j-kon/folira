import type { SpeechChunk, SpeechOptions, ReaderVoice } from '@/types/readAloud';
import { SpeechEngine } from './SpeechEngine';

export class LocalModelSpeechEngine extends SpeechEngine {
  private worker: Worker | null = null;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isInit = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof Worker !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  public async initialise(): Promise<void> {
    if (this.isInit || !this.isSupported()) return;

    try {
      this.worker = new Worker(new URL('../../workers/tts.worker.ts', import.meta.url), { type: 'module' });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      await new Promise<void>((resolve) => {
        if (!this.worker) return resolve();
        this.worker.onmessage = (e) => {
          if (e.data.type === 'INIT_DONE') resolve();
        };
        this.worker.postMessage({ type: 'INIT' });
      });

      this.isInit = true;
    } catch (err) {
      console.warn('LocalModelSpeechEngine initialization failed:', err);
    }
  }

  public async getVoices(): Promise<ReaderVoice[]> {
    return [
      {
        id: 'local_model_folira_en',
        name: 'Folira Neural Local Voice (Bundled)',
        lang: 'en-US',
        isLocal: true,
        engine: 'local-model',
        quality: 'premium',
      },
    ];
  }

  public async speak(chunk: SpeechChunk, options: SpeechOptions): Promise<void> {
    if (!this.isInit) await this.initialise();
    if (!this.worker || !this.audioContext) throw new Error('Local model engine not ready.');

    this.stop();

    return new Promise((resolve, reject) => {
      if (!this.worker) return reject(new Error('Worker closed'));

      this.worker.onmessage = async (e) => {
        if (e.data.type === 'GENERATE_DONE') {
          try {
            const { sampleRate, pcmData } = e.data.payload;
            const floatData = new Float32Array(pcmData);

            if (!this.audioContext) return resolve();
            if (this.audioContext.state === 'suspended') {
              await this.audioContext.resume();
            }

            const audioBuffer = this.audioContext.createBuffer(1, floatData.length, sampleRate);
            audioBuffer.copyToChannel(floatData, 0);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = options.rate;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            this.currentSource = source;

            source.onended = () => {
              this.currentSource = null;
              if (options.onEnd) options.onEnd();
              resolve();
            };

            source.start(0);
          } catch (err: any) {
            if (options.onError) options.onError(err?.message || 'Audio playback error');
            reject(err);
          }
        }
      };

      this.worker.postMessage({
        type: 'GENERATE',
        payload: {
          text: chunk.text,
          voiceId: options.voiceId,
          chunkId: chunk.id,
        },
      });
    });
  }

  public pause(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {}
      this.currentSource = null;
    }
  }

  public async dispose(): Promise<void> {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.isInit = false;
  }
}

export const localModelSpeechEngine = new LocalModelSpeechEngine();

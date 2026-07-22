import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemSpeechEngine } from '../services/readAloud/SystemSpeechEngine';

describe('SystemSpeechEngine', () => {
  let engine: SystemSpeechEngine;

  beforeEach(() => {
    engine = new SystemSpeechEngine();

    // Mock window.speechSynthesis
    const mockVoices: Partial<SpeechSynthesisVoice>[] = [
      { name: 'Alex', lang: 'en-US', localService: true, default: true, voiceURI: 'alex' },
      { name: 'Google US English', lang: 'en-US', localService: false, default: false, voiceURI: 'google' },
    ];

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: vi.fn().mockReturnValue(mockVoices),
        speak: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        cancel: vi.fn(),
        speaking: false,
        paused: false,
        onvoiceschanged: null,
      },
    });
  });

  it('should detect browser support', () => {
    expect(engine.isSupported()).toBe(true);
  });

  it('should discover and filter local system voices', async () => {
    await engine.initialise();
    const voices = await engine.getVoices();

    expect(voices).toHaveLength(2);
    // Local voice comes first
    expect(voices[0].name).toBe('Alex');
    expect(voices[0].isLocal).toBe(true);

    expect(voices[1].name).toBe('Google US English');
    expect(voices[1].isLocal).toBe(false);
  });
});

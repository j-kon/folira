import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../services/database';

describe('Database Schema v3 Migration', () => {
  beforeEach(async () => {
    await db.readAloudProgress.clear();
    await db.voicePacks.clear();
  });

  it('should store and retrieve read aloud progress', async () => {
    const progress = {
      documentId: 'doc-123',
      pageNumber: 5,
      chunkIndex: 2,
      paragraphIndex: 1,
      sentenceIndex: 3,
      characterOffset: 45,
      selectedVoiceId: 'en-US-local',
      selectedEngine: 'system' as const,
      rate: 1.25,
      pitch: 1.0,
      volume: 1.0,
      updatedAt: Date.now(),
    };

    await db.readAloudProgress.put(progress);
    const retrieved = await db.readAloudProgress.get('doc-123');

    expect(retrieved).toBeDefined();
    expect(retrieved?.pageNumber).toBe(5);
    expect(retrieved?.rate).toBe(1.25);
    expect(retrieved?.selectedEngine).toBe('system');
  });

  it('should store and list offline voice pack records', async () => {
    const voicePack = {
      id: 'folira-en-piper-1',
      name: 'Folira English Neutral',
      language: 'en',
      locale: 'en-US',
      version: '1.0.0',
      sizeBytes: 15400000,
      storagePath: '/opfs/voices/folira-en-piper-1',
      licence: 'MIT',
      installedAt: Date.now(),
    };

    await db.voicePacks.put(voicePack);
    const voices = await db.voicePacks.toArray();

    expect(voices).toHaveLength(1);
    expect(voices[0].name).toBe('Folira English Neutral');
  });
});

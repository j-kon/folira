import { describe, it, expect, beforeEach } from 'vitest';
import { useReadAloudStore } from '../stores/useReadAloudStore';
import { db } from '../services/database';

describe('useReadAloudStore', () => {
  beforeEach(async () => {
    useReadAloudStore.setState({
      status: 'idle',
      documentId: null,
      currentPage: 1,
      chunks: [],
      currentChunkIndex: 0,
      activeChunk: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      error: null,
    });
    await db.readAloudProgress.clear();
  });

  it('should update rate within clamped bounds (0.5x to 3.0x)', () => {
    const store = useReadAloudStore.getState();
    store.setRate(1.5);
    expect(useReadAloudStore.getState().rate).toBe(1.5);

    store.setRate(5.0);
    expect(useReadAloudStore.getState().rate).toBe(3.0);

    store.setRate(0.2);
    expect(useReadAloudStore.getState().rate).toBe(0.5);
  });

  it('should save and restore listening position from IndexedDB', async () => {
    const store = useReadAloudStore.getState();
    useReadAloudStore.setState({
      documentId: 'doc-read-test',
      currentPage: 3,
      currentChunkIndex: 2,
      rate: 1.25,
    });

    await store.saveProgress();

    const restored = await store.restoreProgress('doc-read-test');
    expect(restored).toBeDefined();
    expect(restored?.pageNumber).toBe(3);
    expect(restored?.chunkIndex).toBe(2);
    expect(restored?.rate).toBe(1.25);
  });
});

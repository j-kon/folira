import { describe, it, expect } from 'vitest';
import { analyticsService } from '../services/analyticsService';
import type { ReadingSessionRecord } from '../types/analytics';

describe('analyticsService', () => {
  it('should calculate streak accurately for consecutive days', () => {
    const today = Date.now();
    const yesterday = today - 86400000;

    const mockSessions: ReadingSessionRecord[] = [
      {
        id: '1',
        documentId: 'doc-1',
        startTime: today,
        endTime: today + 600000,
        durationSeconds: 600,
        pagesRead: 5,
        format: 'pdf',
        createdAt: today,
      },
      {
        id: '2',
        documentId: 'doc-1',
        startTime: yesterday,
        endTime: yesterday + 600000,
        durationSeconds: 600,
        pagesRead: 5,
        format: 'pdf',
        createdAt: yesterday,
      },
    ];

    const streak = analyticsService.calculateStreak(mockSessions);
    expect(streak).toBe(2);
  });

  it('should return 0 streak for empty sessions', () => {
    const streak = analyticsService.calculateStreak([]);
    expect(streak).toBe(0);
  });
});

import { db } from './database';
import type {
  ReadingSessionRecord,
  ReadingGoalsRecord,
  AnalyticsOverview,
  DailyReadingStat,
} from '@/types/analytics';

const DEFAULT_GOALS: ReadingGoalsRecord = {
  id: 'user-default-goals',
  dailyGoalMinutes: 20,
  weeklyGoalMinutes: 120,
  targetFinishedBooksYear: 12,
  createdAt: Date.now(),
};

export const analyticsService = {
  async logSession(payload: {
    documentId: string;
    startTime: number;
    endTime: number;
    durationSeconds: number;
    pagesRead: number;
    format: 'pdf' | 'epub';
  }): Promise<ReadingSessionRecord> {
    const record: ReadingSessionRecord = {
      id: crypto.randomUUID(),
      documentId: payload.documentId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      durationSeconds: Math.max(1, payload.durationSeconds),
      pagesRead: Math.max(0, payload.pagesRead),
      format: payload.format,
      createdAt: Date.now(),
    };

    await db.readingSessions.put(record);
    return record;
  },

  async getReadingGoals(): Promise<ReadingGoalsRecord> {
    try {
      const existing = await db.readingGoals.get('user-default-goals');
      if (existing) return existing;
      await db.readingGoals.put(DEFAULT_GOALS);
      return DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  },

  async saveReadingGoals(goals: Partial<ReadingGoalsRecord>): Promise<ReadingGoalsRecord> {
    const current = await this.getReadingGoals();
    const updated: ReadingGoalsRecord = {
      ...current,
      ...goals,
      id: 'user-default-goals',
    };
    await db.readingGoals.put(updated);
    return updated;
  },

  calculateStreak(sessions: ReadingSessionRecord[]): number {
    if (sessions.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(
        sessions.map((s) => {
          const d = new Date(s.startTime);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`;
        })
      )
    ).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(uniqueDates[0]);

    for (let i = 0; i < uniqueDates.length; i++) {
      const currStr = uniqueDates[i];
      const dateCheckStr = checkDate.toISOString().split('T')[0];

      if (currStr === dateCheckStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  async getOverview(): Promise<AnalyticsOverview> {
    const sessions = await db.readingSessions.toArray();
    const documents = await db.documents.toArray();
    const goals = await this.getReadingGoals();

    const totalTimeSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalPagesRead = sessions.reduce((acc, s) => acc + s.pagesRead, 0);
    const booksFinished = documents.filter((d) => d.progressPercentage >= 99).length;
    const currentStreakDays = this.calculateStreak(sessions);

    // Calculate today and week reading time
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - now.getDay() * 86400000;

    const todayMinutesRead = Math.round(
      sessions
        .filter((s) => s.startTime >= startOfToday)
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    const thisWeekMinutesRead = Math.round(
      sessions
        .filter((s) => s.startTime >= startOfWeek)
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    // Format breakdown
    const pdfMinutes = Math.round(
      sessions
        .filter((s) => s.format === 'pdf')
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    const epubMinutes = Math.round(
      sessions
        .filter((s) => s.format === 'epub')
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    // Daily stats for past 7 days
    const dailyStats: DailyReadingStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;

      const daySessions = sessions.filter((s) => s.startTime >= dayStart && s.startTime < dayEnd);
      const minutesRead = Math.round(
        daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
      );
      const pagesRead = daySessions.reduce((acc, s) => acc + s.pagesRead, 0);

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyStats.push({
        date: dayLabel,
        minutesRead,
        pagesRead,
      });
    }

    return {
      totalTimeSeconds,
      totalSessions: sessions.length,
      totalPagesRead,
      booksFinished,
      currentStreakDays,
      dailyStats,
      formatBreakdown: { pdfMinutes, epubMinutes },
      todayMinutesRead,
      thisWeekMinutesRead,
      goals,
    };
  },
};

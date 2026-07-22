export interface ReadingSessionRecord {
  id: string;
  documentId: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  pagesRead: number;
  format: 'pdf' | 'epub';
  createdAt: number;
}

export interface ReadingGoalsRecord {
  id: string;
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  targetFinishedBooksYear: number;
  createdAt: number;
}

export interface DailyReadingStat {
  date: string;
  minutesRead: number;
  pagesRead: number;
}

export interface AnalyticsOverview {
  totalTimeSeconds: number;
  totalSessions: number;
  totalPagesRead: number;
  booksFinished: number;
  currentStreakDays: number;
  dailyStats: DailyReadingStat[];
  formatBreakdown: {
    pdfMinutes: number;
    epubMinutes: number;
  };
  todayMinutesRead: number;
  thisWeekMinutesRead: number;
  goals: ReadingGoalsRecord;
}

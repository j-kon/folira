import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import {
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Target,
  Edit3,
  TrendingUp,
  FileText,
  BookMarked,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const AnalyticsPage: React.FC = () => {
  const { overview, isLoading, loadAnalytics, updateGoals } = useAnalyticsStore();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState<string>('20');
  const [weeklyGoalInput, setWeeklyGoalInput] = useState<string>('120');

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (overview?.goals) {
      setDailyGoalInput(String(overview.goals.dailyGoalMinutes));
      setWeeklyGoalInput(String(overview.goals.weeklyGoalMinutes));
    }
  }, [overview]);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(dailyGoalInput, 10);
    const w = parseInt(weeklyGoalInput, 10);
    if (!isNaN(d) && !isNaN(w) && d > 0 && w > 0) {
      updateGoals({ dailyGoalMinutes: d, weeklyGoalMinutes: w });
      setIsEditingGoals(false);
    }
  };

  const formatHoursMins = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Reading Analytics & Goals
              </h1>
              <Badge variant="forest" className="text-xs">
                100% Private
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Track your reading time, build daily streaks, and achieve your reading goals offline.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditingGoals(true)}
          >
            Edit Goals
          </Button>
        </div>

        {isLoading || !overview ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F6B4F] mb-2" />
            <span className="text-xs text-[var(--text-muted)]">Calculating reading statistics...</span>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Reading Time */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Total Time Read
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    {formatHoursMins(overview.totalTimeSeconds)}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                    {overview.totalSessions} reading sessions
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#2F6B4F]/10 dark:bg-[#3D8B67]/20 text-[#2F6B4F] dark:text-[#3D8B67] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Active Streak */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Daily Streak
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-500">
                    {overview.currentStreakDays} {overview.currentStreakDays === 1 ? 'Day' : 'Days'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                    {overview.currentStreakDays > 0 ? 'Keep reading today!' : 'Start a new streak today'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Pages Read */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Pages Completed
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    {overview.totalPagesRead}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1">Total pages read</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Books Finished */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Books Finished
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#2F6B4F] dark:text-[#3D8B67]">
                    {overview.booksFinished}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1">100% completed</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#2F6B4F] dark:text-[#3D8B67] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Middle Section: Chart & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Reading Time Bar Chart (2 Cols) */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <h2 className="font-editorial text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#2F6B4F] dark:text-[#3D8B67]" />
                    Daily Reading Activity (Past 7 Days)
                  </h2>
                  <span className="text-xs font-medium text-[var(--text-muted)]">Minutes read</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                  {overview.dailyStats.map((stat, idx) => {
                    const maxMins = Math.max(1, ...overview.dailyStats.map((s) => s.minutesRead));
                    const heightPercent = Math.max(12, Math.round((stat.minutesRead / maxMins) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[11px] font-semibold text-[#2F6B4F] dark:text-[#3D8B67] opacity-0 group-hover:opacity-100 transition-opacity">
                          {stat.minutesRead}m
                        </span>

                        <div className="w-full bg-[#E8E5DD] dark:bg-[#2D3630] rounded-xl h-full flex items-end overflow-hidden p-1">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#2F6B4F] dark:bg-[#3D8B67] rounded-lg transition-all duration-300 group-hover:bg-[#204B38]"
                          />
                        </div>

                        <span className="text-xs font-semibold text-[var(--text-muted)]">{stat.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reading Goals Progress (1 Col) */}
              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col gap-5">
                <h2 className="font-editorial text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  Reading Goals
                </h2>

                {/* Daily Goal */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">Daily Reading Goal</span>
                    <span className="font-mono text-[var(--text-muted)]">
                      {overview.todayMinutesRead} / {overview.goals.dailyGoalMinutes} min
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#E8E5DD] dark:bg-[#2D3630] rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (overview.todayMinutesRead / overview.goals.dailyGoalMinutes) * 100
                        )}%`,
                      }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Weekly Goal */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">Weekly Reading Goal</span>
                    <span className="font-mono text-[var(--text-muted)]">
                      {overview.thisWeekMinutesRead} / {overview.goals.weeklyGoalMinutes} min
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#E8E5DD] dark:bg-[#2D3630] rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (overview.thisWeekMinutesRead / overview.goals.weeklyGoalMinutes) * 100
                        )}%`,
                      }}
                      className="h-full bg-[#2F6B4F] dark:bg-[#3D8B67] rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Format Breakdown */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Format Distribution
                  </span>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                      <FileText className="w-4 h-4 text-[#2F6B4F]" /> PDF Documents
                    </span>
                    <span className="font-semibold">{overview.formatBreakdown.pdfMinutes} min</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                      <BookMarked className="w-4 h-4 text-amber-600" /> EPUB Ebooks
                    </span>
                    <span className="font-semibold">{overview.formatBreakdown.epubMinutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Goal Edit Modal */}
        {isEditingGoals && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveGoals}
              className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <h3 className="font-editorial text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#2F6B4F]" /> Update Reading Goals
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Daily Reading Target (Minutes / Day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={dailyGoalInput}
                  onChange={(e) => setDailyGoalInput(e.target.value)}
                  className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Weekly Reading Target (Minutes / Week)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={weeklyGoalInput}
                  onChange={(e) => setWeeklyGoalInput(e.target.value)}
                  className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Button variant="ghost" size="sm" onClick={() => setIsEditingGoals(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Reading Goals
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

import { create } from 'zustand';
import { analyticsService } from '@/services/analyticsService';
import type { AnalyticsOverview, ReadingGoalsRecord } from '@/types/analytics';

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  isLoading: boolean;

  loadAnalytics: () => Promise<void>;
  updateGoals: (goals: Partial<ReadingGoalsRecord>) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  overview: null,
  isLoading: false,

  loadAnalytics: async () => {
    set({ isLoading: true });
    try {
      const data = await analyticsService.getOverview();
      set({ overview: data, isLoading: false });
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
      set({ isLoading: false });
    }
  },

  updateGoals: async (goals: Partial<ReadingGoalsRecord>) => {
    await analyticsService.saveReadingGoals(goals);
    await get().loadAnalytics();
  },
}));

import { useEffect, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { useReaderStore } from '@/stores/useReaderStore';

export const useReadingTracker = (documentId: string | null, format: 'pdf' | 'epub' = 'pdf') => {
  const startTimeRef = useRef<number | null>(null);
  const activeSecondsRef = useRef<number>(0);
  const startPageRef = useRef<number>(1);
  const { currentPage } = useReaderStore();

  useEffect(() => {
    if (!documentId) return;

    startTimeRef.current = Date.now();
    activeSecondsRef.current = 0;
    startPageRef.current = currentPage;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (startTimeRef.current && activeSecondsRef.current >= 3) {
        const pagesDelta = Math.abs(useReaderStore.getState().currentPage - startPageRef.current) + 1;
        analyticsService
          .logSession({
            documentId,
            startTime: startTimeRef.current,
            endTime: Date.now(),
            durationSeconds: activeSecondsRef.current,
            pagesRead: pagesDelta,
            format,
          })
          .catch((err) => console.error('Failed to log reading session:', err));
      }
    };
  }, [documentId, format, currentPage]);
};

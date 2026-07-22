import React from 'react';

export const DocumentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
      <div className="flex justify-between items-center mt-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-1" />
    </div>
  );
};

export const DocumentListItemSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-xl p-3.5 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-10 h-12 bg-gray-200 dark:bg-gray-800 rounded-md shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
        </div>
      </div>
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    </div>
  );
};

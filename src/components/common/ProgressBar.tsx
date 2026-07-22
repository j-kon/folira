import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  variant?: 'forest' | 'gold' | 'error';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = false,
  variant = 'forest',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  const barVariants = {
    forest: 'bg-[#2F6B4F]',
    gold: 'bg-[#C89545]',
    error: 'bg-[#D32F2F]',
  };

  return (
    <div className={twMerge('flex flex-col gap-1 w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-[#525B56] dark:text-[#C0C8C3]">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2 bg-[#E8E5DD] dark:bg-[#2D3630] rounded-full overflow-hidden"
      >
        <div
          className={twMerge('h-full transition-all duration-300 rounded-full', barVariants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

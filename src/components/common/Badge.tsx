import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'default' | 'forest' | 'gold' | 'warning' | 'error' | 'success';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  icon,
}) => {
  const variantStyles = {
    default: 'bg-[#E8E5DD] text-[#252A27] dark:bg-[#2E3630] dark:text-[#F8F5EE]',
    forest: 'bg-[#DDEBE2] text-[#2F6B4F] dark:bg-[#1C382B] dark:text-[#3D8B67]',
    gold: 'bg-[#F2E4CB] text-[#3E2723] dark:bg-[#3E301B] dark:text-[#D4A559]',
    warning: 'bg-[#FFF3E0] text-[#ED6C02] dark:bg-[#3E2A14] dark:text-[#FFA726]',
    error: 'bg-[#FFEBEE] text-[#D32F2F] dark:bg-[#3E1A1A] dark:text-[#EF5350]',
    success: 'bg-[#E8F5E9] text-[#2E7D32] dark:bg-[#1B381E] dark:text-[#66BB6A]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full select-none',
          variantStyles[variant],
          className
        )
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

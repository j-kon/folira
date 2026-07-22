import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#252A27] dark:text-[#F8F5EE]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-[#7A857F] pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 text-sm bg-[#FFFDF8] dark:bg-[#1E2420] text-[#252A27] dark:text-[#F8F5EE] border border-[#E8E5DD] dark:border-[#2D3630] rounded-lg placeholder-[#7A857F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6B4F] focus:border-transparent disabled:opacity-50 disabled:bg-[#E8E5DD]/30',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#D32F2F] focus:ring-[#D32F2F]',
              className
            )
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#7A857F] shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-[#D32F2F] font-medium">{error}</span>}
    </div>
  );
};

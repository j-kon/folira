import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  icon: React.ReactNode;
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  title,
  ...props
}) => {
  const sizeStyles = {
    sm: 'p-1.5 min-w-[32px] min-h-[32px]',
    md: 'p-2 min-w-[40px] min-h-[40px]',
    lg: 'p-2.5 min-w-[48px] min-h-[48px]',
  };

  const variantStyles = {
    ghost: 'text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]/60 dark:hover:bg-[#2E3630]',
    secondary: 'bg-[#DDEBE2] text-[#2F6B4F] hover:bg-[#c9e0d1]',
    outline: 'border border-[#E8E5DD] dark:border-[#2D3630] text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]/40',
  };

  return (
    <button
      aria-label={ariaLabel}
      title={title || ariaLabel}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {icon}
    </button>
  );
};

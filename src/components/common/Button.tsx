import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'icon-only';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-[#2F6B4F] text-[#FFFDF8] hover:bg-[#204B38] shadow-sm',
    secondary: 'bg-[#DDEBE2] text-[#2F6B4F] hover:bg-[#c9e0d1] border border-transparent',
    tertiary: 'bg-[#F8F5EE] text-[#252A27] border border-[#E8E5DD] hover:bg-[#E8E5DD]',
    ghost: 'bg-transparent text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]/50 dark:hover:bg-[#2E3630]',
    destructive: 'bg-[#D32F2F] text-white hover:bg-[#b71c1c] shadow-sm',
    'icon-only': 'p-2 text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]/50 dark:hover:bg-[#2E3630] rounded-full',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--color-emerald-accent)] text-white hover:bg-[var(--color-emerald-hover)] focus-visible:ring-[var(--color-emerald-accent)] shadow-xs',
      secondary:
        'bg-[var(--color-warm-subtle)] text-[var(--color-charcoal)] hover:bg-[var(--color-warm-border)] dark:bg-[var(--color-dark-subtle)] dark:text-[var(--color-dark-text)] dark:hover:bg-[var(--color-dark-border)] focus-visible:ring-gray-400',
      outline:
        'border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] focus-visible:ring-gray-400',
      ghost:
        'text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] focus-visible:ring-gray-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

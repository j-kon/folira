import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="p-2 rounded-xl text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emerald-accent)]"
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
};

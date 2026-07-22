import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../stores/useUIStore';

describe('Theme Store & DOM Sync', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('should toggle theme and sync both dark class and data-theme attribute', () => {
    useUIStore.getState().toggleTheme();

    expect(useUIStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    useUIStore.getState().toggleTheme();

    expect(useUIStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should set theme explicitly', () => {
    useUIStore.getState().setTheme('dark');

    expect(useUIStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

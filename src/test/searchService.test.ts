import { describe, it, expect } from 'vitest';
import { useSearchStore } from '../stores/useSearchStore';

describe('useSearchStore', () => {
  it('should initialize with empty query and matches', () => {
    const store = useSearchStore.getState();
    expect(store.query).toBe('');
    expect(store.matches).toEqual([]);
    expect(store.activeMatchIndex).toBe(-1);
  });

  it('should toggle and close search overlay', () => {
    const store = useSearchStore.getState();
    store.openSearch();
    expect(useSearchStore.getState().isSearchOpen).toBe(true);

    store.closeSearch();
    expect(useSearchStore.getState().isSearchOpen).toBe(false);
  });
});

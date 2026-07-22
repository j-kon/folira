import { create } from 'zustand';
import type { SearchMatch } from '@/types/search';
import { pdfService } from '@/services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import { useReaderStore } from './useReaderStore';

interface SearchState {
  query: string;
  matches: SearchMatch[];
  activeMatchIndex: number;
  isSearching: boolean;
  isSearchOpen: boolean;

  setQuery: (query: string) => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  performSearch: (query: string, pdfDoc?: pdfjsLib.PDFDocumentProxy | null) => Promise<void>;
  nextMatch: () => void;
  prevMatch: () => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  matches: [],
  activeMatchIndex: -1,
  isSearching: false,
  isSearchOpen: false,

  setQuery: (query: string) => set({ query }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, query: '', matches: [], activeMatchIndex: -1 }),

  performSearch: async (query: string, pdfDoc?: pdfjsLib.PDFDocumentProxy | null) => {
    const trimmed = query.trim();
    set({ query, isSearching: true });

    if (!trimmed) {
      set({ matches: [], activeMatchIndex: -1, isSearching: false });
      return;
    }

    try {
      let results: SearchMatch[] = [];
      if (pdfDoc) {
        results = await pdfService.searchDocumentText(pdfDoc, trimmed);
      }

      const activeIdx = results.length > 0 ? 0 : -1;
      set({ matches: results, activeMatchIndex: activeIdx, isSearching: false });

      if (results.length > 0) {
        useReaderStore.getState().setCurrentPage(results[0].pageNumber);
      }
    } catch (err) {
      console.error('Search error:', err);
      set({ matches: [], activeMatchIndex: -1, isSearching: false });
    }
  },

  nextMatch: () => {
    const { matches, activeMatchIndex } = get();
    if (matches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matches.length;
    set({ activeMatchIndex: nextIdx });

    const targetMatch = matches[nextIdx];
    if (targetMatch) {
      useReaderStore.getState().setCurrentPage(targetMatch.pageNumber);
    }
  },

  prevMatch: () => {
    const { matches, activeMatchIndex } = get();
    if (matches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matches.length) % matches.length;
    set({ activeMatchIndex: prevIdx });

    const targetMatch = matches[prevIdx];
    if (targetMatch) {
      useReaderStore.getState().setCurrentPage(targetMatch.pageNumber);
    }
  },

  clearSearch: () => set({ query: '', matches: [], activeMatchIndex: -1 }),
}));

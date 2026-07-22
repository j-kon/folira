import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';

interface UIState {
  theme: AppTheme;
  renameModalDocId: string | null;
  deleteConfirmDocId: string | null;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  openRenameModal: (docId: string) => void;
  closeRenameModal: () => void;
  openDeleteConfirm: (docId: string) => void;
  closeDeleteConfirm: () => void;
}

const applyThemeToDocument = (theme: AppTheme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      renameModalDocId: null,
      deleteConfirmDocId: null,
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },
      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light';
          applyThemeToDocument(nextTheme);
          return { theme: nextTheme };
        });
      },
      openRenameModal: (docId) => set({ renameModalDocId: docId }),
      closeRenameModal: () => set({ renameModalDocId: null }),
      openDeleteConfirm: (docId) => set({ deleteConfirmDocId: docId }),
      closeDeleteConfirm: () => set({ deleteConfirmDocId: null }),
    }),
    {
      name: 'folira-ui-settings',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);

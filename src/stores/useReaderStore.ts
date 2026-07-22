import { create } from 'zustand';
import type * as pdfjsLib from 'pdfjs-dist';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';
import type { ReaderBackgroundTheme, ZoomLevelOption } from '@/types/reader';
import { documentStorage } from '@/services/documentStorage';
import { pdfService } from '@/services/pdfService';
import { useNotificationStore } from './useNotificationStore';
import { useDocumentStore } from './useDocumentStore';

interface ReaderState {
  activeDocumentId: string | null;
  document: DocumentRecord | null;
  pdfDocProxy: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  zoomMode: ZoomLevelOption;
  backgroundTheme: ReaderBackgroundTheme;
  isSidebarOpen: boolean;
  activeSidebarTab: 'info' | 'thumbnails' | 'bookmarks' | 'toc';
  isFullscreen: boolean;
  bookmarks: BookmarkRecord[];
  isLoading: boolean;
  error: string | null;
  lastSavedAt: number | null;

  loadReaderSession: (documentId: string) => Promise<void>;
  setCurrentPage: (pageNumber: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  setZoomLevel: (zoom: ZoomLevelOption) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setBackgroundTheme: (theme: ReaderBackgroundTheme) => void;
  toggleSidebar: () => void;
  setActiveSidebarTab: (tab: 'info' | 'thumbnails' | 'bookmarks' | 'toc') => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  addBookmarkForCurrentPage: (customLabel?: string) => Promise<void>;
  deleteBookmark: (bookmarkId: string) => Promise<void>;
  closeReaderSession: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  activeDocumentId: null,
  document: null,
  pdfDocProxy: null,
  currentPage: 1,
  totalPages: 1,
  zoomLevel: 1.0,
  zoomMode: 'fit-width',
  backgroundTheme: (localStorage.getItem('folira_reader_theme') as ReaderBackgroundTheme) || 'paper',
  isSidebarOpen: false,
  activeSidebarTab: 'info',
  isFullscreen: false,
  bookmarks: [],
  isLoading: false,
  error: null,
  lastSavedAt: null,

  loadReaderSession: async (documentId: string) => {
    set({ isLoading: true, error: null, activeDocumentId: documentId });
    try {
      const doc = await documentStorage.getDocumentById(documentId);
      if (!doc) {
        set({ error: 'Document not found in local library.', isLoading: false });
        return;
      }

      await documentStorage.updateLastOpened(documentId);
      const bookmarks = await documentStorage.getBookmarksForDocument(documentId);

      if (doc.format === 'epub') {
        const initialPage = Math.min(Math.max(1, doc.currentPage || 1), doc.totalPages || 1);
        set({
          document: { ...doc, lastOpenedAt: Date.now() },
          pdfDocProxy: null,
          currentPage: initialPage,
          totalPages: doc.totalPages || 1,
          bookmarks,
          isLoading: false,
          lastSavedAt: Date.now(),
        });
      } else {
        const pdfProxy = await pdfService.loadDocument(doc.fileBlob);
        const initialPage = Math.min(Math.max(1, doc.currentPage || 1), pdfProxy.numPages);
        set({
          document: { ...doc, lastOpenedAt: Date.now() },
          pdfDocProxy: pdfProxy,
          currentPage: initialPage,
          totalPages: pdfProxy.numPages,
          bookmarks,
          isLoading: false,
          lastSavedAt: Date.now(),
        });
      }

      useDocumentStore.getState().loadDocuments();
    } catch (err: any) {
      console.error('Failed to load reader session:', err);
      let errorMsg = 'Failed to open document. The file data may be missing or corrupted.';
      if (err?.name === 'PasswordException' || err?.message?.includes('password')) {
        errorMsg = 'This PDF document is password-protected or encrypted.';
      }
      set({
        error: errorMsg,
        isLoading: false,
      });
    }
  },

  setCurrentPage: async (pageNumber: number) => {
    const { totalPages, document: doc, activeDocumentId } = get();
    if (!doc || !activeDocumentId) return;

    const safePage = Math.min(Math.max(1, pageNumber), totalPages);
    set({ currentPage: safePage, lastSavedAt: Date.now() });

    // Use debounced saver to prevent rapid IDB writes
    documentStorage.debouncedUpdateReadingProgress(activeDocumentId, safePage, totalPages);

    set((state) => ({
      document: state.document
        ? {
            ...state.document,
            currentPage: safePage,
            progressPercentage: Math.round((safePage / totalPages) * 100),
          }
        : null,
    }));
  },

  nextPage: async () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      await get().setCurrentPage(currentPage + 1);
    }
  },

  prevPage: async () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      await get().setCurrentPage(currentPage - 1);
    }
  },

  setZoomLevel: (zoom: ZoomLevelOption) => {
    const current = get().zoomLevel;
    let nextZoom = current;

    if (zoom === 'fit-width') nextZoom = 1.0;
    else if (zoom === 'fit-page') nextZoom = 0.85;
    else nextZoom = Math.min(Math.max(0.5, zoom), 3.0);

    set({ zoomLevel: nextZoom, zoomMode: zoom });
  },

  zoomIn: () => {
    const current = get().zoomLevel;
    const next = Math.min(3.0, current + 0.15);
    set({ zoomLevel: next, zoomMode: next });
  },

  zoomOut: () => {
    const current = get().zoomLevel;
    const next = Math.max(0.5, current - 0.15);
    set({ zoomLevel: next, zoomMode: next });
  },

  setBackgroundTheme: (theme: ReaderBackgroundTheme) => {
    localStorage.setItem('folira_reader_theme', theme);
    set({ backgroundTheme: theme });
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setActiveSidebarTab: (tab: 'info' | 'thumbnails' | 'bookmarks' | 'toc') => set({ activeSidebarTab: tab }),

  setIsFullscreen: (fullscreen: boolean) => set({ isFullscreen: fullscreen }),

  toggleFullscreen: () => {
    const isCurrentlyFull = !!document.fullscreenElement;
    if (!isCurrentlyFull) {
      document.documentElement.requestFullscreen().catch(() => {});
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      set({ isFullscreen: false });
    }
  },

  addBookmarkForCurrentPage: async (customLabel?: string) => {
    const { activeDocumentId, currentPage, bookmarks } = get();
    if (!activeDocumentId) return;

    const alreadyBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);
    if (alreadyBookmarked) {
      useNotificationStore.getState().showToast(`Page ${currentPage} is already bookmarked.`, 'info');
      return;
    }

    const label = customLabel || `Page ${currentPage}`;
    const newBm = await documentStorage.addBookmark(activeDocumentId, currentPage, label);

    set((state) => ({
      bookmarks: [...state.bookmarks, newBm].sort((a, b) => a.pageNumber - b.pageNumber),
    }));

    useNotificationStore.getState().showToast(`Bookmarked Page ${currentPage}`, 'success');
  },

  deleteBookmark: async (bookmarkId: string) => {
    await documentStorage.deleteBookmark(bookmarkId);
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
    }));
    useNotificationStore.getState().showToast('Bookmark removed.', 'info');
  },

  closeReaderSession: () => {
    const { pdfDocProxy } = get();
    if (pdfDocProxy) {
      pdfDocProxy.destroy();
    }
    set({
      activeDocumentId: null,
      document: null,
      pdfDocProxy: null,
      currentPage: 1,
      totalPages: 1,
      bookmarks: [],
      error: null,
      isLoading: false,
    });
  },
}));

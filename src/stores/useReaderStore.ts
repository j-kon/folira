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

      const pdfProxy = await pdfService.loadDocument(doc.fileBlob);
      const bookmarks = await documentStorage.getBookmarksForDocument(documentId);

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

  setZoomLevel: (zoom) => {
    if (typeof zoom === 'number') {
      const clamped = Math.max(0.5, Math.min(3.0, Math.round(zoom * 100) / 100));
      set({ zoomLevel: clamped, zoomMode: clamped });
    } else {
      set({ zoomMode: zoom });
    }
  },

  zoomIn: () => {
    const { zoomLevel } = get();
    const newZoom = Math.min(3.0, Math.round((zoomLevel + 0.25) * 100) / 100);
    set({ zoomLevel: newZoom, zoomMode: newZoom });
  },

  zoomOut: () => {
    const { zoomLevel } = get();
    const newZoom = Math.max(0.5, Math.round((zoomLevel - 0.25) * 100) / 100);
    set({ zoomLevel: newZoom, zoomMode: newZoom });
  },

  setBackgroundTheme: (backgroundTheme) => {
    localStorage.setItem('folira_reader_theme', backgroundTheme);
    set({ backgroundTheme });
  },
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab, isSidebarOpen: true }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  addBookmarkForCurrentPage: async (customLabel) => {
    const { activeDocumentId, currentPage, bookmarks } = get();
    if (!activeDocumentId) return;

    const existing = bookmarks.find((b) => b.pageNumber === currentPage);
    if (existing) {
      useNotificationStore.getState().showToast(`Page ${currentPage} is already bookmarked`, 'info');
      return;
    }

    const label = customLabel || `Page ${currentPage}`;
    try {
      const newBookmark = await documentStorage.addBookmark(activeDocumentId, currentPage, label);
      set({ bookmarks: [...bookmarks, newBookmark].sort((a, b) => a.pageNumber - b.pageNumber) });
      useNotificationStore.getState().showToast(`Bookmarked page ${currentPage}`, 'success');
    } catch (err) {
      console.error('Failed to add bookmark:', err);
      useNotificationStore.getState().showToast('Could not save bookmark', 'error');
    }
  },

  deleteBookmark: async (bookmarkId: string) => {
    try {
      await documentStorage.deleteBookmark(bookmarkId);
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
      }));
      useNotificationStore.getState().showToast('Bookmark removed', 'info');
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  },

  closeReaderSession: () => {
    const { pdfDocProxy } = get();
    if (pdfDocProxy) {
      try {
        if (typeof (pdfDocProxy as any).destroy === 'function') {
          (pdfDocProxy as any).destroy();
        } else if (typeof (pdfDocProxy as any).cleanup === 'function') {
          (pdfDocProxy as any).cleanup();
        }
      } catch (e) {
        console.warn('PDF Proxy cleanup error:', e);
      }
    }

    set({
      activeDocumentId: null,
      document: null,
      pdfDocProxy: null,
      currentPage: 1,
      totalPages: 1,
      zoomLevel: 1.0,
      zoomMode: 'fit-width',
      isSidebarOpen: false,
      bookmarks: [],
      error: null,
      lastSavedAt: null,
    });
  },
}));

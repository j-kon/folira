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
  backgroundTheme: 'light',
  isSidebarOpen: false,
  activeSidebarTab: 'info',
  isFullscreen: false,
  bookmarks: [],
  isLoading: false,
  error: null,

  loadReaderSession: async (documentId: string) => {
    set({ isLoading: true, error: null, activeDocumentId: documentId });
    try {
      const doc = await documentStorage.getDocumentById(documentId);
      if (!doc) {
        set({ error: 'Document not found in local library.', isLoading: false });
        return;
      }

      // Update lastOpenedAt
      await documentStorage.updateLastOpened(documentId);

      // Load PDF via PDF.js
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
      });

      // Refresh main document store list so lastOpenedAt is updated
      useDocumentStore.getState().loadDocuments();
    } catch (err) {
      console.error('Failed to load reader session:', err);
      set({
        error: 'Failed to open document. The file data may be missing or corrupted.',
        isLoading: false,
      });
    }
  },

  setCurrentPage: async (pageNumber: number) => {
    const { totalPages, document: doc, activeDocumentId } = get();
    if (!doc || !activeDocumentId) return;

    const safePage = Math.min(Math.max(1, pageNumber), totalPages);
    set({ currentPage: safePage });

    try {
      await documentStorage.updateReadingProgress(activeDocumentId, safePage, totalPages);
      // Update local doc state
      set((state) => ({
        document: state.document
          ? {
              ...state.document,
              currentPage: safePage,
              progressPercentage: Math.round((safePage / totalPages) * 100),
            }
          : null,
      }));
    } catch (err) {
      console.error('Failed to save reading progress:', err);
    }
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
      set({ zoomLevel: Math.max(0.5, Math.min(3.0, zoom)), zoomMode: zoom });
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

  setBackgroundTheme: (backgroundTheme) => set({ backgroundTheme }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab, isSidebarOpen: true }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  addBookmarkForCurrentPage: async (customLabel) => {
    const { activeDocumentId, currentPage, bookmarks } = get();
    if (!activeDocumentId) return;

    // Check if page is already bookmarked
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
    });
  },
}));

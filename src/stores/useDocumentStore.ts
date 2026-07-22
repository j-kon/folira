import { create } from 'zustand';
import type { DocumentRecord, DocumentFilter, ViewMode, SortOption } from '@/types/document';
import { documentStorage } from '@/services/documentStorage';
import { pdfService } from '@/services/pdfService';
import { validatePdfFile } from '@/utils/validators';
import { useNotificationStore } from './useNotificationStore';

interface DocumentState {
  documents: DocumentRecord[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgressMessage: string | null;
  searchQuery: string;
  filter: DocumentFilter;
  sortOption: SortOption;
  viewMode: ViewMode;

  loadDocuments: () => Promise<void>;
  importDocument: (file: File) => Promise<DocumentRecord | null>;
  toggleFavourite: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: DocumentFilter) => void;
  setSortOption: (option: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: true,
  isUploading: false,
  uploadProgressMessage: null,
  searchQuery: '',
  filter: 'all',
  sortOption: 'lastOpened',
  viewMode: 'grid',

  loadDocuments: async () => {
    set({ isLoading: true });
    try {
      const docs = await documentStorage.getAllDocuments();
      set({ documents: docs, isLoading: false });
    } catch (error) {
      console.error('Failed to load documents from database:', error);
      useNotificationStore.getState().showToast('Could not load library documents.', 'error');
      set({ isLoading: false });
    }
  },

  importDocument: async (file: File) => {
    const { showToast } = useNotificationStore.getState();

    // 1. Validate file
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid PDF file.', 'error');
      return null;
    }

    // 2. Check duplicate
    try {
      const isDuplicate = await documentStorage.checkIsDuplicate(file.name, file.size);
      if (isDuplicate) {
        showToast(`"${file.name}" has already been imported into your library.`, 'info');
      }
    } catch (err) {
      console.warn('Duplicate check failed:', err);
    }

    set({ isUploading: true, uploadProgressMessage: 'Parsing PDF file...' });

    try {
      // 3. Load PDF via PDF.js to verify validity & extract page count
      const pdfDoc = await pdfService.loadDocument(file);
      const totalPages = pdfDoc.numPages;

      set({ uploadProgressMessage: 'Generating document thumbnail...' });
      const thumbnailUrl = await pdfService.generateThumbnail(pdfDoc);

      set({ uploadProgressMessage: 'Saving to local storage...' });

      // Clean file name
      const cleanName = file.name.endsWith('.pdf') ? file.name.slice(0, -4) : file.name;

      const newDoc: DocumentRecord = {
        id: crypto.randomUUID(),
        name: cleanName,
        originalName: file.name,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
        fileBlob: file,
        totalPages: totalPages > 0 ? totalPages : 1,
        currentPage: 1,
        progressPercentage: 0,
        isFavourite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOpenedAt: null,
        thumbnailUrl,
      };

      await documentStorage.saveDocument(newDoc);
      await get().loadDocuments();

      showToast(`Successfully imported "${newDoc.name}"`, 'success');
      set({ isUploading: false, uploadProgressMessage: null });
      return newDoc;
    } catch (error) {
      console.error('PDF Import error:', error);
      showToast(`Failed to parse PDF document "${file.name}". File may be corrupted or encrypted.`, 'error');
      set({ isUploading: false, uploadProgressMessage: null });
      return null;
    }
  },

  toggleFavourite: async (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return;
    const newFavState = !doc.isFavourite;
    try {
      await documentStorage.toggleFavourite(id, newFavState);
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, isFavourite: newFavState, updatedAt: Date.now() } : d
        ),
      }));
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    }
  },

  renameDocument: async (id: string, newName: string) => {
    try {
      await documentStorage.renameDocument(id, newName);
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, name: newName.trim(), updatedAt: Date.now() } : d
        ),
      }));
      useNotificationStore.getState().showToast('Document renamed', 'success');
    } catch (err) {
      console.error('Failed to rename document:', err);
      useNotificationStore.getState().showToast('Failed to rename document', 'error');
    }
  },

  deleteDocument: async (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    try {
      await documentStorage.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
      useNotificationStore
        .getState()
        .showToast(doc ? `Removed "${doc.name}" from library` : 'Document deleted', 'info');
    } catch (err) {
      console.error('Failed to delete document:', err);
      useNotificationStore.getState().showToast('Failed to remove document', 'error');
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (filter) => set({ filter }),
  setSortOption: (sortOption) => set({ sortOption }),
  setViewMode: (viewMode) => set({ viewMode }),
}));

import { create } from 'zustand';
import type { DocumentRecord, DocumentFilter, ViewMode, SortOption } from '@/types/document';
import { documentStorage } from '@/services/documentStorage';
import { pdfService } from '@/services/pdfService';
import { validatePdfFile } from '@/utils/validators';
import { calculateFileFingerprint } from '@/utils/crypto';
import { getStorageEstimate } from '@/utils/storageQuota';
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

  duplicateDoc: DocumentRecord | null;
  pendingFile: File | null;

  loadDocuments: () => Promise<void>;
  importDocument: (file: File, forceDuplicate?: boolean) => Promise<DocumentRecord | null>;
  resolveDuplicateImportCopy: () => Promise<DocumentRecord | null>;
  dismissDuplicateModal: () => void;
  toggleFavourite: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearAllDocuments: () => Promise<void>;
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
  duplicateDoc: null,
  pendingFile: null,

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

  importDocument: async (file: File, forceDuplicate = false) => {
    const { showToast } = useNotificationStore.getState();

    // Prevent duplicate submission while already processing
    if (get().isUploading) {
      return null;
    }

    // 1. Validate file format & magic bytes
    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid PDF file.', 'error');
      return null;
    }

    // 2. Storage Quota Check
    try {
      const estimate = await getStorageEstimate();
      if (estimate.isAvailable && estimate.quota > 0) {
        const remainingSpace = estimate.quota - estimate.usage;
        if (file.size > remainingSpace) {
          showToast(
            `Insufficient storage space on this device. File requires ${(file.size / (1024 * 1024)).toFixed(1)} MB, but only ${(remainingSpace / (1024 * 1024)).toFixed(1)} MB is available.`,
            'error'
          );
          return null;
        }
      }
    } catch (err) {
      console.warn('Storage quota pre-check error:', err);
    }

    // 3. Fingerprint duplicate detection
    let fingerprint = '';
    try {
      fingerprint = await calculateFileFingerprint(file);
      if (!forceDuplicate) {
        const existing = await documentStorage.checkIsDuplicateByFingerprint(fingerprint);
        if (existing) {
          set({ duplicateDoc: existing, pendingFile: file });
          return null;
        }
      }
    } catch (err) {
      console.warn('Fingerprint calculation failed:', err);
    }

    set({ isUploading: true, uploadProgressMessage: 'Parsing PDF file contents...' });

    try {
      // 4. Parse PDF via PDF.js
      const pdfDoc = await pdfService.loadDocument(file);
      const totalPages = pdfDoc.numPages;

      set({ uploadProgressMessage: 'Generating document thumbnail...' });
      const thumbnailUrl = await pdfService.generateThumbnail(pdfDoc);

      set({ uploadProgressMessage: 'Saving to browser local database...' });

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
        fingerprint: fingerprint || crypto.randomUUID(),
        thumbnailUrl,
      };

      await documentStorage.saveDocument(newDoc);
      await get().loadDocuments();

      showToast(`Successfully imported "${newDoc.name}"`, 'success');
      set({ isUploading: false, uploadProgressMessage: null, duplicateDoc: null, pendingFile: null });
      return newDoc;
    } catch (error: any) {
      console.error('PDF Import error:', error);
      let message = `Failed to parse PDF document "${file.name}".`;
      if (error?.name === 'PasswordException' || error?.message?.includes('password')) {
        message = `"${file.name}" is password-protected or encrypted. Please remove password protection before importing.`;
      } else if (error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        message = `Browser storage quota exceeded. Please remove existing documents or free up disk space.`;
      } else if (error?.message) {
        message += ` ${error.message}`;
      }

      showToast(message, 'error');
      set({ isUploading: false, uploadProgressMessage: null, duplicateDoc: null, pendingFile: null });
      return null;
    }
  },

  resolveDuplicateImportCopy: async () => {
    const file = get().pendingFile;
    if (!file) return null;
    set({ duplicateDoc: null });
    return get().importDocument(file, true);
  },

  dismissDuplicateModal: () => {
    set({ duplicateDoc: null, pendingFile: null });
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

  clearAllDocuments: async () => {
    try {
      await documentStorage.clearAllData();
      set({ documents: [] });
      useNotificationStore.getState().showToast('Cleared all library documents and reading data.', 'info');
    } catch (err) {
      console.error('Failed to clear documents:', err);
      useNotificationStore.getState().showToast('Could not clear local data.', 'error');
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (filter) => set({ filter }),
  setSortOption: (sortOption) => set({ sortOption }),
  setViewMode: (viewMode) => set({ viewMode }),
}));

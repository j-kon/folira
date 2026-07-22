import { create } from 'zustand';
import type { DocumentRecord, DocumentFilter, ViewMode, SortOption } from '@/types/document';
import { documentStorage } from '@/services/documentStorage';
import { pdfService } from '@/services/pdfService';
import { epubParserService } from '@/services/epubParserService';
import { validatePdfFile } from '@/utils/validators';
import { validateEpubFile } from '@/services/epubValidator';
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

    const isEpub = file.name.toLowerCase().endsWith('.epub') || file.type === 'application/epub+zip';

    // 1. Validate file format & magic bytes
    if (isEpub) {
      try {
        await validateEpubFile(file);
      } catch (err: any) {
        showToast(err?.message || 'Invalid EPUB file.', 'error');
        return null;
      }
    } else {
      const validation = await validatePdfFile(file);
      if (!validation.isValid) {
        showToast(validation.error || 'Invalid PDF file.', 'error');
        return null;
      }
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

    set({ isUploading: true, uploadProgressMessage: `Parsing ${isEpub ? 'EPUB' : 'PDF'} file contents...` });

    try {
      let totalPages = 1;
      let thumbnailUrl: string | undefined = undefined;
      let epubMetadata;
      const cleanName = isEpub
        ? file.name.replace(/\.epub$/i, '')
        : file.name.replace(/\.pdf$/i, '');

      if (isEpub) {
        const { packageData, coverBlobUrl } = await epubParserService.parseEpub(file);
        totalPages = packageData.spine.length || 1;
        thumbnailUrl = coverBlobUrl;
        epubMetadata = packageData.metadata;
      } else {
        const pdfDoc = await pdfService.loadDocument(file);
        totalPages = pdfDoc.numPages;
        set({ uploadProgressMessage: 'Generating document thumbnail...' });
        thumbnailUrl = await pdfService.generateThumbnail(pdfDoc);
      }

      set({ uploadProgressMessage: 'Saving to browser local database...' });

      const newDoc: DocumentRecord = {
        id: crypto.randomUUID(),
        name: cleanName,
        originalName: file.name,
        mimeType: file.type || (isEpub ? 'application/epub+zip' : 'application/pdf'),
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
        format: isEpub ? 'epub' : 'pdf',
        epubMetadata,
        chapterIndex: 0,
      };

      await documentStorage.saveDocument(newDoc);
      await get().loadDocuments();

      showToast(`Successfully imported "${newDoc.name}"`, 'success');
      set({ isUploading: false, uploadProgressMessage: null, duplicateDoc: null, pendingFile: null });
      return newDoc;
    } catch (error: any) {
      console.error('Import error:', error);
      let message = `Failed to parse document "${file.name}".`;
      if (error?.name === 'PasswordException' || error?.message?.includes('password')) {
        message = `"${file.name}" is password-protected. Please remove password protection before importing.`;
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
    const { pendingFile, importDocument } = get();
    if (!pendingFile) return null;
    return importDocument(pendingFile, true);
  },

  dismissDuplicateModal: () => {
    set({ duplicateDoc: null, pendingFile: null });
  },

  toggleFavourite: async (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return;
    const updatedStatus = !doc.isFavourite;
    await documentStorage.toggleFavourite(id, updatedStatus);
    await get().loadDocuments();
  },

  renameDocument: async (id: string, newName: string) => {
    await documentStorage.renameDocument(id, newName);
    await get().loadDocuments();
  },

  deleteDocument: async (id: string) => {
    await documentStorage.deleteDocument(id);
    await get().loadDocuments();
    useNotificationStore.getState().showToast('Document deleted from library.', 'info');
  },

  clearAllDocuments: async () => {
    await documentStorage.clearAllData();
    await get().loadDocuments();
    useNotificationStore.getState().showToast('All library documents cleared.', 'info');
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilter: (filter: DocumentFilter) => set({ filter }),
  setSortOption: (option: SortOption) => set({ sortOption: option }),
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
}));

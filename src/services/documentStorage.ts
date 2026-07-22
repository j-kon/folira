import { db } from './database';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';

let progressDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface FoliraMetadataBackup {
  version: '1.0';
  exportedAt: number;
  documents: Omit<DocumentRecord, 'fileBlob'>[];
  bookmarks: BookmarkRecord[];
}

export const documentStorage = {
  async getAllDocuments(): Promise<DocumentRecord[]> {
    return db.documents.toArray();
  },

  async getDocumentById(id: string): Promise<DocumentRecord | undefined> {
    return db.documents.get(id);
  },

  async saveDocument(doc: DocumentRecord): Promise<string> {
    await db.documents.put(doc);
    return doc.id;
  },

  async updateReadingProgress(id: string, currentPage: number, totalPages: number): Promise<void> {
    const doc = await db.documents.get(id);
    if (!doc) return;

    const safeTotal = totalPages > 0 ? totalPages : 1;
    const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
    const progressPercentage = Math.round((safeCurrent / safeTotal) * 100);

    await db.documents.update(id, {
      currentPage: safeCurrent,
      totalPages: safeTotal,
      progressPercentage,
      lastOpenedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },

  debouncedUpdateReadingProgress(id: string, currentPage: number, totalPages: number, delayMs = 300): void {
    if (progressDebounceTimer) {
      clearTimeout(progressDebounceTimer);
    }
    progressDebounceTimer = setTimeout(() => {
      this.updateReadingProgress(id, currentPage, totalPages).catch((err) => {
        console.error('Debounced progress update failed:', err);
      });
    }, delayMs);
  },

  async updateLastOpened(id: string): Promise<void> {
    await db.documents.update(id, {
      lastOpenedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },

  async toggleFavourite(id: string, isFavourite: boolean): Promise<void> {
    await db.documents.update(id, {
      isFavourite,
      updatedAt: Date.now(),
    });
  },

  async renameDocument(id: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await db.documents.update(id, {
      name: trimmed,
      updatedAt: Date.now(),
    });
  },

  async deleteDocument(id: string): Promise<void> {
    await db.transaction('rw', db.documents, db.bookmarks, async () => {
      await db.documents.delete(id);
      await db.bookmarks.where('documentId').equals(id).delete();
    });
  },

  async checkIsDuplicateByFingerprint(fingerprint: string): Promise<DocumentRecord | undefined> {
    if (!fingerprint) return undefined;
    return db.documents.where('fingerprint').equals(fingerprint).first();
  },

  // Bookmark methods
  async getBookmarksForDocument(documentId: string): Promise<BookmarkRecord[]> {
    return db.bookmarks.where('documentId').equals(documentId).sortBy('pageNumber');
  },

  async getAllBookmarks(): Promise<BookmarkRecord[]> {
    return db.bookmarks.toArray();
  },

  async addBookmark(documentId: string, pageNumber: number, label: string): Promise<BookmarkRecord> {
    const newBookmark: BookmarkRecord = {
      id: crypto.randomUUID(),
      documentId,
      pageNumber,
      label,
      createdAt: Date.now(),
    };
    await db.bookmarks.add(newBookmark);
    return newBookmark;
  },

  async deleteBookmark(id: string): Promise<void> {
    await db.bookmarks.delete(id);
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', db.documents, db.bookmarks, async () => {
      await db.documents.clear();
      await db.bookmarks.clear();
    });
  },

  async exportMetadataJson(): Promise<string> {
    const docs = await db.documents.toArray();
    const bookmarks = await db.bookmarks.toArray();

    const docsWithoutBlobs = docs.map(({ fileBlob: _, ...rest }) => rest);

    const backupData: FoliraMetadataBackup = {
      version: '1.0',
      exportedAt: Date.now(),
      documents: docsWithoutBlobs,
      bookmarks,
    };

    return JSON.stringify(backupData, null, 2);
  },

  async importMetadataJson(jsonString: string): Promise<{ importedDocs: number; importedBookmarks: number }> {
    const data = JSON.parse(jsonString) as FoliraMetadataBackup;
    if (!data || data.version !== '1.0' || !Array.isArray(data.documents) || !Array.isArray(data.bookmarks)) {
      throw new Error('Invalid metadata backup file structure.');
    }

    let docCount = 0;
    let bookmarkCount = 0;

    await db.transaction('rw', db.documents, db.bookmarks, async () => {
      for (const metaDoc of data.documents) {
        const existing = await db.documents.get(metaDoc.id);
        if (existing) {
          // Update metadata fields on existing document record
          await db.documents.update(metaDoc.id, {
            name: metaDoc.name,
            currentPage: metaDoc.currentPage,
            progressPercentage: metaDoc.progressPercentage,
            isFavourite: metaDoc.isFavourite,
            lastOpenedAt: metaDoc.lastOpenedAt,
            updatedAt: Date.now(),
          });
          docCount++;
        }
      }

      for (const bm of data.bookmarks) {
        const existingDoc = await db.documents.get(bm.documentId);
        if (existingDoc) {
          await db.bookmarks.put(bm);
          bookmarkCount++;
        }
      }
    });

    return { importedDocs: docCount, importedBookmarks: bookmarkCount };
  },
};

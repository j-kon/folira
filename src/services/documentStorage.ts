import { db } from './database';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';

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

  async checkIsDuplicate(originalName: string, fileSize: number): Promise<boolean> {
    const existing = await db.documents
      .where('originalName')
      .equals(originalName)
      .and(doc => doc.fileSize === fileSize)
      .first();
    return !!existing;
  },

  // Bookmark methods
  async getBookmarksForDocument(documentId: string): Promise<BookmarkRecord[]> {
    return db.bookmarks
      .where('documentId')
      .equals(documentId)
      .sortBy('pageNumber');
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
};

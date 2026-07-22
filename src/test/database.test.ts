import { describe, it, expect, beforeEach } from 'vitest';
import { documentStorage } from '@/services/documentStorage';
import { db } from '@/services/database';
import type { DocumentRecord } from '@/types/document';

describe('documentStorage Service', () => {
  beforeEach(async () => {
    await db.documents.clear();
    await db.bookmarks.clear();
  });

  it('should save and retrieve a document record', async () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      name: 'Test Guide',
      originalName: 'test-guide.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      fileBlob: new Blob(['test content'], { type: 'application/pdf' }),
      totalPages: 10,
      currentPage: 1,
      progressPercentage: 10,
      isFavourite: false,
      createdAt: 1000,
      updatedAt: 1000,
      lastOpenedAt: null,
    };

    await documentStorage.saveDocument(doc);
    const retrieved = await documentStorage.getDocumentById('doc-123');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Guide');
    expect(retrieved?.totalPages).toBe(10);
  });

  it('should update reading progress correctly', async () => {
    const doc: DocumentRecord = {
      id: 'doc-456',
      name: 'Reading Progress Test',
      originalName: 'progress.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      fileBlob: new Blob(['content']),
      totalPages: 20,
      currentPage: 1,
      progressPercentage: 5,
      isFavourite: false,
      createdAt: 1000,
      updatedAt: 1000,
      lastOpenedAt: null,
    };

    await documentStorage.saveDocument(doc);
    await documentStorage.updateReadingProgress('doc-456', 10, 20);

    const updated = await documentStorage.getDocumentById('doc-456');
    expect(updated?.currentPage).toBe(10);
    expect(updated?.progressPercentage).toBe(50);
    expect(updated?.lastOpenedAt).not.toBeNull();
  });

  it('should delete document and its associated bookmarks', async () => {
    const doc: DocumentRecord = {
      id: 'doc-789',
      name: 'Delete Test',
      originalName: 'delete.pdf',
      mimeType: 'application/pdf',
      fileSize: 500,
      fileBlob: new Blob(['data']),
      totalPages: 5,
      currentPage: 1,
      progressPercentage: 20,
      isFavourite: false,
      createdAt: 1000,
      updatedAt: 1000,
      lastOpenedAt: null,
    };

    await documentStorage.saveDocument(doc);
    await documentStorage.addBookmark('doc-789', 3, 'Chapter 2');

    let bookmarks = await documentStorage.getBookmarksForDocument('doc-789');
    expect(bookmarks.length).toBe(1);

    await documentStorage.deleteDocument('doc-789');

    const deletedDoc = await documentStorage.getDocumentById('doc-789');
    expect(deletedDoc).toBeUndefined();

    bookmarks = await documentStorage.getBookmarksForDocument('doc-789');
    expect(bookmarks.length).toBe(0);
  });
});

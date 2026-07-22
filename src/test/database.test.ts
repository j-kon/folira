import { describe, it, expect, beforeEach } from 'vitest';
import { documentStorage } from '@/services/documentStorage';
import { db } from '@/services/database';
import type { DocumentRecord } from '@/types/document';
import { calculateFileFingerprint } from '@/utils/crypto';

describe('documentStorage Service', () => {
  beforeEach(async () => {
    await db.documents.clear();
    await db.bookmarks.clear();
  });

  it('should save and retrieve a document record with fingerprint', async () => {
    const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
    const fingerprint = await calculateFileFingerprint(file);

    const doc: DocumentRecord = {
      id: 'doc-123',
      name: 'Test Guide',
      originalName: 'test-guide.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      fileBlob: file,
      totalPages: 10,
      currentPage: 1,
      progressPercentage: 10,
      isFavourite: false,
      createdAt: 1000,
      updatedAt: 1000,
      lastOpenedAt: null,
      fingerprint,
      format: 'pdf',
    };

    await documentStorage.saveDocument(doc);
    const retrieved = await documentStorage.getDocumentById('doc-123');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fingerprint).toBe(fingerprint);

    const duplicateLookup = await documentStorage.checkIsDuplicateByFingerprint(fingerprint);
    expect(duplicateLookup).toBeDefined();
    expect(duplicateLookup?.id).toBe('doc-123');
  });

  it('should export and import JSON metadata backup correctly', async () => {
    const doc: DocumentRecord = {
      id: 'doc-backup',
      name: 'Backup Test Document',
      originalName: 'backup.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      fileBlob: new Blob(['pdf bytes']),
      totalPages: 15,
      currentPage: 5,
      progressPercentage: 33,
      isFavourite: true,
      createdAt: 1000,
      updatedAt: 1000,
      lastOpenedAt: 2000,
      fingerprint: 'fp-123',
      format: 'pdf',
    };

    await documentStorage.saveDocument(doc);
    await documentStorage.addBookmark('doc-backup', 5, 'Chapter 1');

    const json = await documentStorage.exportMetadataJson();
    expect(json).toContain('Backup Test Document');
    expect(json).toContain('Chapter 1');

    // Test import
    const result = await documentStorage.importMetadataJson(json);
    expect(result.importedDocs).toBe(1);
  });
});

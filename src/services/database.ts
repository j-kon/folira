import Dexie, { type Table } from 'dexie';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';
import { calculateFileFingerprint } from '@/utils/crypto';

export class FoliraDatabase extends Dexie {
  documents!: Table<DocumentRecord, string>;
  bookmarks!: Table<BookmarkRecord, string>;

  constructor() {
    super('FoliraDatabase');

    this.version(1).stores({
      documents: 'id, name, isFavourite, lastOpenedAt, createdAt',
      bookmarks: 'id, documentId, pageNumber, createdAt',
    });

    this.version(2)
      .stores({
        documents: 'id, name, isFavourite, lastOpenedAt, createdAt, fingerprint',
        bookmarks: 'id, documentId, pageNumber, createdAt',
      })
      .upgrade(async (tx) => {
        return tx
          .table('documents')
          .toCollection()
          .modify(async (doc: DocumentRecord) => {
            if (!doc.fingerprint && doc.fileBlob) {
              try {
                doc.fingerprint = await calculateFileFingerprint(doc.fileBlob);
              } catch {
                doc.fingerprint = doc.id;
              }
            }
          });
      });
  }
}

export const db = new FoliraDatabase();

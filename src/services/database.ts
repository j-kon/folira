import Dexie, { type Table } from 'dexie';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';
import type { ReadAloudProgress, VoicePackRecord } from '@/types/readAloud';
import { calculateFileFingerprint } from '@/utils/crypto';

export class FoliraDatabase extends Dexie {
  documents!: Table<DocumentRecord, string>;
  bookmarks!: Table<BookmarkRecord, string>;
  readAloudProgress!: Table<ReadAloudProgress, string>;
  voicePacks!: Table<VoicePackRecord, string>;

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

    this.version(3).stores({
      documents: 'id, name, isFavourite, lastOpenedAt, createdAt, fingerprint',
      bookmarks: 'id, documentId, pageNumber, createdAt',
      readAloudProgress: 'documentId, pageNumber, updatedAt',
      voicePacks: 'id, name, language, locale, installedAt',
    });

    this.version(4)
      .stores({
        documents: 'id, name, format, isFavourite, lastOpenedAt, createdAt, fingerprint',
        bookmarks: 'id, documentId, pageNumber, createdAt',
        readAloudProgress: 'documentId, pageNumber, updatedAt',
        voicePacks: 'id, name, language, locale, installedAt',
      })
      .upgrade(async (tx) => {
        return tx
          .table('documents')
          .toCollection()
          .modify((doc: DocumentRecord) => {
            if (!doc.format) {
              doc.format = 'pdf';
            }
          });
      });
  }
}

export const db = new FoliraDatabase();

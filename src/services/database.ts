import Dexie, { type Table } from 'dexie';
import type { DocumentRecord } from '@/types/document';
import type { BookmarkRecord } from '@/types/bookmark';

export class FoliraDatabase extends Dexie {
  documents!: Table<DocumentRecord, string>;
  bookmarks!: Table<BookmarkRecord, string>;

  constructor() {
    super('FoliraDatabase');

    this.version(1).stores({
      documents: 'id, name, isFavourite, lastOpenedAt, createdAt',
      bookmarks: 'id, documentId, pageNumber, createdAt',
    });
  }
}

export const db = new FoliraDatabase();

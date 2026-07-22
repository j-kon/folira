import type { EpubMetadata } from './epub';

export interface DocumentRecord {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileBlob: Blob;
  totalPages: number;
  currentPage: number;
  progressPercentage: number;
  isFavourite: boolean;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number | null;
  fingerprint: string;
  thumbnailUrl?: string;
  format: 'pdf' | 'epub';
  epubMetadata?: EpubMetadata;
  chapterIndex?: number;
  chapterHref?: string;
}

export type DocumentFilter = 'all' | 'favourites' | 'recent';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'lastOpened' | 'name' | 'createdAt' | 'progress';

export interface DocumentUploadPayload {
  file: File;
  customName?: string;
}

export type AnnotationColor = 'gold' | 'forest' | 'rose' | 'sky';

export interface AnnotationRecord {
  id: string;
  documentId: string;
  pageNumber: number;
  selectedText: string;
  color: AnnotationColor;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

import React from 'react';
import type { DocumentRecord } from '@/types/document';
import { DocumentListItem } from './DocumentListItem';
import { DocumentListItemSkeleton } from '../common/Skeleton';

export interface DocumentListProps {
  documents: DocumentRecord[];
  isLoading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DocumentListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => (
        <DocumentListItem key={doc.id} document={doc} />
      ))}
    </div>
  );
};

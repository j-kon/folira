import React from 'react';
import type { DocumentRecord } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { DocumentCardSkeleton } from '../common/Skeleton';

export interface DocumentGridProps {
  documents: DocumentRecord[];
  isLoading?: boolean;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};

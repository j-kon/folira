import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Star, BookOpen } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { DocumentMenu } from './DocumentMenu';
import { Button } from '../common/Button';

export interface DocumentListItemProps {
  document: DocumentRecord;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({ document: doc }) => {
  const navigate = useNavigate();
  const { toggleFavourite } = useDocumentStore();

  const handleOpen = () => {
    navigate(`/reader/${doc.id}`);
  };

  return (
    <div
      onClick={handleOpen}
      className="group relative bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-emerald-accent)] dark:hover:border-[var(--color-emerald-accent)] rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all duration-200 shadow-xs cursor-pointer"
    >
      {/* Icon & File info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-12 rounded-lg bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] flex items-center justify-center text-[var(--color-emerald-accent)] shrink-0 border border-[var(--color-warm-border)]/50 dark:border-[var(--color-dark-border)]/50 overflow-hidden">
          {doc.thumbnailUrl ? (
            <img src={doc.thumbnailUrl} alt={doc.name} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-6 h-6 stroke-[1.5]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              title={doc.name}
              className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] truncate group-hover:text-[var(--color-emerald-accent)] transition-colors"
            >
              {doc.name}
            </h3>
            {doc.isFavourite && (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>•</span>
            <span>Pg {doc.currentPage} of {doc.totalPages} ({doc.progressPercentage}%)</span>
            <span>•</span>
            <span>{formatDate(doc.lastOpenedAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleFavourite(doc.id)}
          aria-label={doc.isFavourite ? 'Unmark favourite' : 'Mark favourite'}
          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 transition-colors"
        >
          <Star
            className={`w-4 h-4 ${
              doc.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'
            }`}
          />
        </button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpen}
          leftIcon={<BookOpen className="w-3.5 h-3.5" />}
        >
          Open
        </Button>

        <DocumentMenu document={doc} onOpen={handleOpen} />
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Star, BookOpen } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { DocumentMenu } from './DocumentMenu';
import { Button } from '../common/Button';

export interface DocumentCardProps {
  document: DocumentRecord;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document: doc }) => {
  const navigate = useNavigate();
  const { toggleFavourite } = useDocumentStore();

  const handleOpen = () => {
    navigate(`/reader/${doc.id}`);
  };

  return (
    <div
      onClick={handleOpen}
      className="group relative bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-emerald-accent)] dark:hover:border-[var(--color-emerald-accent)] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
    >
      {/* Thumbnail or Fallback PDF Graphic */}
      <div className="relative w-full aspect-[4/3] bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center border border-[var(--color-warm-border)]/50 dark:border-[var(--color-dark-border)]/50">
        {doc.thumbnailUrl ? (
          <img
            src={doc.thumbnailUrl}
            alt={`Thumbnail of ${doc.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-emerald-accent)] transition-colors">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
              PDF
            </span>
          </div>
        )}

        {/* Favourite Star Button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(doc.id);
          }}
          aria-label={doc.isFavourite ? 'Unmark favourite' : 'Mark favourite'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white transition-colors"
        >
          <Star
            className={`w-4 h-4 ${
              doc.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-white/80'
            }`}
          />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              title={doc.name}
              className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] line-clamp-2 leading-snug group-hover:text-[var(--color-emerald-accent)] transition-colors"
            >
              {doc.name}
            </h3>
            <div onClick={(e) => e.stopPropagation()}>
              <DocumentMenu document={doc} onOpen={handleOpen} />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>{formatDate(doc.lastOpenedAt)}</span>
          </div>
        </div>

        {/* Reading Progress */}
        <div className="mt-3 pt-3 border-t border-[var(--color-warm-border)]/60 dark:border-[var(--color-dark-border)]/60">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] mb-1.5">
            <span>
              Pg {doc.currentPage} of {doc.totalPages}
            </span>
            <span>{doc.progressPercentage}%</span>
          </div>

          <div className="w-full h-1.5 bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-emerald-accent)] transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, doc.progressPercentage))}%` }}
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-3 group-hover:bg-[var(--color-emerald-accent)] group-hover:text-white transition-colors"
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            {doc.currentPage > 1 ? 'Continue Reading' : 'Start Reading'}
          </Button>
        </div>
      </div>
    </div>
  );
};

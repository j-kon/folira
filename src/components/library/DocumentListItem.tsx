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
      className="group relative bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] hover:border-[#2F6B4F] dark:hover:border-[#3D8B67] rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all duration-200 shadow-sm cursor-pointer"
    >
      {/* Icon & File info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-12 rounded-lg bg-[#F8F5EE] dark:bg-[#151A17] flex items-center justify-center text-[#2F6B4F] dark:text-[#3D8B67] shrink-0 border border-[#E8E5DD] dark:border-[#2D3630] overflow-hidden">
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
              className="font-editorial text-sm font-semibold text-[#252A27] dark:text-[#F8F5EE] truncate group-hover:text-[#2F6B4F] dark:group-hover:text-[#3D8B67] transition-colors"
            >
              {doc.name}
            </h3>
            {doc.isFavourite && (
              <Star className="w-3.5 h-3.5 fill-[#C89545] text-[#C89545] shrink-0" />
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-[#7A857F] dark:text-[#8E9992]">
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
          className="p-1.5 rounded-lg text-[#7A857F] hover:text-[#C89545] transition-colors"
        >
          <Star
            className={`w-4 h-4 ${
              doc.isFavourite ? 'fill-[#C89545] text-[#C89545]' : 'text-[#7A857F]'
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

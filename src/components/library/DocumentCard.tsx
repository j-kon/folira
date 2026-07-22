import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Star, BookOpen } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { DocumentMenu } from './DocumentMenu';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

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
      className="group relative bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] hover:border-[#2F6B4F] dark:hover:border-[#3D8B67] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
    >
      {/* Thumbnail or Fallback PDF Graphic */}
      <div className="relative w-full aspect-[4/3] bg-[#F8F5EE] dark:bg-[#151A17] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center border border-[#E8E5DD]/60 dark:border-[#2D3630]">
        {doc.thumbnailUrl ? (
          <img
            src={doc.thumbnailUrl}
            alt={`Thumbnail of ${doc.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#7A857F] dark:text-[#8E9992] group-hover:text-[#2F6B4F] transition-colors">
            <FileText className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8E5DD] dark:bg-[#2D3630] px-2 py-0.5 rounded-md text-[#525B56] dark:text-[#C0C8C3]">
              PDF
            </span>
          </div>
        )}

        {/* Favorite Star Overlay */}
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
              doc.isFavourite ? 'fill-[#C89545] text-[#C89545]' : 'text-white/80'
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
              className="font-editorial text-base font-semibold text-[#252A27] dark:text-[#F8F5EE] line-clamp-2 leading-snug group-hover:text-[#2F6B4F] dark:group-hover:text-[#3D8B67] transition-colors"
            >
              {doc.name}
            </h3>
            <div onClick={(e) => e.stopPropagation()}>
              <DocumentMenu document={doc} onOpen={handleOpen} />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-[#7A857F] dark:text-[#8E9992]">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>{formatDate(doc.lastOpenedAt)}</span>
          </div>
        </div>

        {/* Reading Progress */}
        <div className="mt-3 pt-3 border-t border-[#E8E5DD] dark:border-[#2D3630]">
          <ProgressBar
            value={doc.progressPercentage || 0}
            label={`Page ${doc.currentPage} of ${doc.totalPages}`}
            showPercentage
            variant="forest"
          />

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-3 group-hover:bg-[#2F6B4F] group-hover:text-white transition-colors"
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            {doc.currentPage > 1 ? 'Continue Reading' : 'Start Reading'}
          </Button>
        </div>
      </div>
    </div>
  );
};

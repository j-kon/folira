import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Volume2 } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { formatTimeAgo, formatFileSize } from '@/utils/formatters';
import { useReadAloudStore } from '@/stores/useReadAloudStore';

export interface ContinueReadingCardProps {
  document: DocumentRecord;
}

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({ document }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/reader/${document.id}`);
  };

  const handleListen = () => {
    useReadAloudStore.getState().startListening(document.id, document.currentPage || 1);
    navigate(`/reader/${document.id}`);
  };

  return (
    <div className="w-full bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Thumbnail Preview */}
        <div
          onClick={handleOpen}
          className="w-full md:w-36 h-48 md:h-44 bg-[#F8F5EE] dark:bg-[#151A17] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group relative shadow-inner"
        >
          {document.thumbnailUrl ? (
            <img
              src={document.thumbnailUrl}
              alt={`Cover thumbnail for ${document.name}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#7A857F] group-hover:text-[#2F6B4F] transition-colors p-4 text-center">
              <BookOpen className="w-10 h-10" />
              <span className="text-xs font-medium line-clamp-2">{document.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-[#2F6B4F]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-[#2F6B4F] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
              Resume Reading
            </span>
          </div>
        </div>

        {/* Info & Progress */}
        <div className="flex-1 flex flex-col justify-between w-full h-full gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2F6B4F] dark:text-[#3D8B67]">
                Continue Reading
              </span>
              <span className="text-xs text-[#7A857F] dark:text-[#8E9992] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(document.lastOpenedAt)}
              </span>
            </div>

            <h3
              onClick={handleOpen}
              className="font-editorial text-xl sm:text-2xl font-bold text-[#252A27] dark:text-[#F8F5EE] hover:text-[#2F6B4F] dark:hover:text-[#3D8B67] cursor-pointer transition-colors line-clamp-2 leading-snug"
              title={document.name}
            >
              {document.name}
            </h3>

            <p className="mt-1 text-xs text-[#525B56] dark:text-[#C0C8C3]">
              {document.originalName} • {formatFileSize(document.fileSize)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ProgressBar
              value={document.progressPercentage || 0}
              label={`Page ${document.currentPage} of ${document.totalPages}`}
              showPercentage
              variant="forest"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#7A857F] dark:text-[#8E9992]">
                {document.totalPages - document.currentPage === 0
                  ? 'Completed'
                  : `${document.totalPages - document.currentPage} pages left`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Volume2 className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />}
                  onClick={handleListen}
                >
                  Listen
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleOpen}
                >
                  Continue Reading
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

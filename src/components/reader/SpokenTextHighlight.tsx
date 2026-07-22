import React from 'react';
import { useReadAloudStore } from '@/stores/useReadAloudStore';
import { useReaderStore } from '@/stores/useReaderStore';
import { Button } from '../common/Button';
import { Navigation, Volume2 } from 'lucide-react';

export const SpokenTextHighlight: React.FC = () => {
  const { activeChunk, status, currentPage: spokenPage, followNarration } = useReadAloudStore();
  const { currentPage: readerPage, setCurrentPage } = useReaderStore();

  if (!activeChunk || status === 'idle' || status === 'stopped' || status === 'completed') {
    return null;
  }

  const isDifferentPage = readerPage !== spokenPage;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#2F6B4F]/30 dark:border-[#3D8B67]/30 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-[#2F6B4F] dark:text-[#3D8B67]">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            Reading Page {spokenPage} • Sentence {activeChunk.sentenceIndex + 1}
          </span>

          {isDifferentPage && !followNarration && (
            <Button
              variant="tertiary"
              size="sm"
              leftIcon={<Navigation className="w-3.5 h-3.5" />}
              onClick={() => setCurrentPage(spokenPage)}
            >
              Return to page being read
            </Button>
          )}
        </div>

        <p className="font-editorial text-sm sm:text-base text-[#252A27] dark:text-[#F8F5EE] leading-relaxed bg-[#2F6B4F]/10 dark:bg-[#3D8B67]/15 p-2.5 rounded-lg border-l-4 border-[#2F6B4F] dark:border-[#3D8B67]">
          "{activeChunk.text}"
        </p>
      </div>
    </div>
  );
};

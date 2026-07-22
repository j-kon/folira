import React from 'react';
import { useReadAloudStore } from '@/stores/useReadAloudStore';
import { useReaderStore } from '@/stores/useReaderStore';
import { IconButton } from '../common/IconButton';
import { Play, Pause, Square, SkipBack, SkipForward, Maximize2, Volume2 } from 'lucide-react';

export interface MiniAudioPlayerProps {
  onExpand: () => void;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({ onExpand }) => {
  const { status, activeChunk, currentPage, rate, play, pause, resume, stop, nextSentence, prevSentence } = useReadAloudStore();
  const { document } = useReaderStore();

  if (status === 'idle' || status === 'stopped' || status === 'completed') {
    return null;
  }

  const isPlaying = status === 'playing';

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      play();
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-[#FFFDF8]/95 dark:bg-[#1E2420]/95 backdrop-blur-md border border-[#E8E5DD] dark:border-[#2D3630] rounded-2xl p-3 shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Info & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onExpand}>
          <div className="w-9 h-9 rounded-xl bg-[#2F6B4F] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-editorial text-sm font-bold text-[#252A27] dark:text-[#F8F5EE] truncate">
              {document?.name || 'Reading Aloud'}
            </h4>
            <p className="text-xs text-[#7A857F] dark:text-[#8E9992] truncate">
              Page {currentPage} • {rate}x speed • {activeChunk ? `"${activeChunk.text.slice(0, 30)}..."` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon={<SkipBack className="w-4 h-4" />}
            label="Previous Sentence"
            onClick={prevSentence}
            variant="ghost"
            size="sm"
          />

          <IconButton
            icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            label={isPlaying ? 'Pause' : 'Play'}
            onClick={handleTogglePlay}
            variant="primary"
            size="sm"
          />

          <IconButton
            icon={<SkipForward className="w-4 h-4" />}
            label="Next Sentence"
            onClick={nextSentence}
            variant="ghost"
            size="sm"
          />

          <IconButton
            icon={<Square className="w-3.5 h-3.5 text-red-600" />}
            label="Stop"
            onClick={stop}
            variant="ghost"
            size="sm"
          />

          <IconButton
            icon={<Maximize2 className="w-4 h-4" />}
            label="Expand Player"
            onClick={onExpand}
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

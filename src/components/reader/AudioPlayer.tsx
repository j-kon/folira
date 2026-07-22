import React from 'react';
import { useReadAloudStore } from '@/stores/useReadAloudStore';
import { useReaderStore } from '@/stores/useReaderStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Gauge,
  Moon,
  ShieldCheck,
} from 'lucide-react';

export interface AudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isOpen, onClose }) => {
  const {
    status,
    activeChunk,
    currentPage,
    chunks,
    currentChunkIndex,
    rate,
    volume,
    selectedVoiceId,
    availableVoices,
    sleepTimerMinutes,
    play,
    pause,
    resume,
    stop,
    nextSentence,
    prevSentence,
    nextPage,
    prevPage,
    setRate,
    setVolume,
    setSelectedVoice,
    setSleepTimer,
  } = useReadAloudStore();

  const { document, totalPages } = useReaderStore();

  if (!isOpen) return null;

  const activeVoice = availableVoices.find((v) => v.id === selectedVoiceId);
  const isPlaying = status === 'playing';

  const speedPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
  const sleepPresets = [null, 5, 15, 30, 45, 60];

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
    <Modal isOpen={isOpen} onClose={onClose} title="Folira Read Aloud" maxWidth="lg">
      <div className="flex flex-col gap-6 p-1">
        {/* Document & Offline Voice Badge */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E8E5DD] dark:border-[#2D3630] pb-4">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#252A27] dark:text-[#F8F5EE] line-clamp-1">
              {document?.name || 'Document'}
            </h3>
            <p className="text-xs text-[#7A857F] dark:text-[#8E9992] mt-0.5">
              Page {currentPage} of {totalPages} • Sentence {currentChunkIndex + 1} of {chunks.length || 1}
            </p>
          </div>

          <Badge variant={activeVoice?.isLocal ? 'forest' : 'gold'} className="shrink-0 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {activeVoice?.isLocal ? 'Offline Local Voice' : 'System Voice'}
          </Badge>
        </div>

        {/* Spoken Text Sentence Preview */}
        <div className="bg-[#F8F5EE] dark:bg-[#151A17] p-4 rounded-xl border border-[#E8E5DD] dark:border-[#2D3630] min-h-[90px] flex items-center justify-center text-center">
          {activeChunk ? (
            <p className="font-editorial text-base sm:text-lg text-[#252A27] dark:text-[#F8F5EE] leading-relaxed">
              "{activeChunk.text}"
            </p>
          ) : (
            <p className="text-sm text-[#7A857F] italic">Ready to read aloud...</p>
          )}
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
          <IconButton
            icon={<ChevronLeft className="w-5 h-5" />}
            aria-label="Previous Page"
            onClick={prevPage}
            variant="ghost"
          />

          <IconButton
            icon={<SkipBack className="w-5 h-5" />}
            aria-label="Previous Sentence"
            onClick={prevSentence}
            variant="secondary"
          />

          <Button
            variant="primary"
            size="lg"
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center shadow-lg"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause Narration' : 'Play Narration'}
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </Button>

          <IconButton
            icon={<SkipForward className="w-5 h-5" />}
            aria-label="Next Sentence"
            onClick={nextSentence}
            variant="secondary"
          />

          <IconButton
            icon={<ChevronRight className="w-5 h-5" />}
            aria-label="Next Page"
            onClick={nextPage}
            variant="ghost"
          />

          <IconButton
            icon={<Square className="w-4 h-4 text-red-600" />}
            aria-label="Stop Playback"
            onClick={stop}
            variant="ghost"
          />
        </div>

        {/* Settings: Voice, Speed, Sleep Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E5DD] dark:border-[#2D3630]">
          {/* Voice Selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="voice-select" className="text-xs font-semibold text-[#525B56] dark:text-[#C0C8C3] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              Voice Selection
            </label>
            <select
              id="voice-select"
              value={selectedVoiceId || ''}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] text-[#252A27] dark:text-[#F8F5EE] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]"
            >
              {availableVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.lang}){v.isLocal ? ' • Offline' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Reading Speed Preset Picker */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="speed-select" className="text-xs font-semibold text-[#525B56] dark:text-[#C0C8C3] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              Reading Speed ({rate}x)
            </label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {speedPresets.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setRate(speed)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${rate === speed ? 'bg-[#2F6B4F] text-white font-bold' : 'bg-[#E8E5DD]/60 dark:bg-[#2D3630] text-[#525B56] dark:text-[#C0C8C3] hover:bg-[#E8E5DD]'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="volume-range" className="text-xs font-semibold text-[#525B56] dark:text-[#C0C8C3] flex items-center gap-1.5">
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              Volume ({Math.round(volume * 100)}%)
            </label>
            <input
              id="volume-range"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#2F6B4F]"
            />
          </div>

          {/* Sleep Timer */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sleep-timer" className="text-xs font-semibold text-[#525B56] dark:text-[#C0C8C3] flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              Sleep Timer {sleepTimerMinutes ? `(${sleepTimerMinutes}m)` : '(Off)'}
            </label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {sleepPresets.map((mins) => (
                <button
                  key={mins ?? 0}
                  onClick={() => setSleepTimer(mins)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${sleepTimerMinutes === mins ? 'bg-[#2F6B4F] text-white font-bold' : 'bg-[#E8E5DD]/60 dark:bg-[#2D3630] text-[#525B56] dark:text-[#C0C8C3] hover:bg-[#E8E5DD]'}`}
                >
                  {mins ? `${mins}m` : 'Off'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import { create } from 'zustand';
import type {
  PlaybackStatus,
  SpeechEngineType,
  ReaderVoice,
  SpeechChunk,
  ReadAloudProgress,
} from '@/types/readAloud';
import { systemSpeechEngine } from '@/services/readAloud/SystemSpeechEngine';
import { pdfTextExtractionService } from '@/services/pdfTextExtractionService';
import { generateSpeechChunks } from '@/services/readAloud/speechChunker';
import { db } from '@/services/database';
import { useReaderStore } from './useReaderStore';
import { useNotificationStore } from './useNotificationStore';

interface ReadAloudState {
  status: PlaybackStatus;
  documentId: string | null;
  currentPage: number;
  chunks: SpeechChunk[];
  currentChunkIndex: number;
  activeChunk: SpeechChunk | null;
  currentCharIndex: number;
  currentCharLength: number;
  selectedEngine: SpeechEngineType;
  selectedVoiceId: string | undefined;
  availableVoices: ReaderVoice[];

  rate: number;
  pitch: number;
  volume: number;
  followNarration: boolean;
  highlightEnabled: boolean;

  sleepTimerMinutes: number | null; // null or 5, 10, 15, 30, 45, 60
  sleepTimerEndTime: number | null;
  error: string | null;

  // Methods
  initialiseVoices: () => Promise<void>;
  startListening: (documentId: string, pageNumber?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextSentence: () => Promise<void>;
  prevSentence: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;

  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setSelectedVoice: (voiceId: string) => void;
  setSelectedEngine: (engine: SpeechEngineType) => void;
  setFollowNarration: (follow: boolean) => void;
  setHighlightEnabled: (highlight: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;

  saveProgress: () => Promise<void>;
  restoreProgress: (documentId: string) => Promise<ReadAloudProgress | null>;
}

let sleepIntervalTimer: any = null;

export const useReadAloudStore = create<ReadAloudState>((set, get) => ({
  status: 'idle',
  documentId: null,
  currentPage: 1,
  chunks: [],
  currentChunkIndex: 0,
  activeChunk: null,
  currentCharIndex: 0,
  currentCharLength: 0,
  selectedEngine: 'system',
  selectedVoiceId: localStorage.getItem('folira_selected_voice_id') || undefined,
  availableVoices: [],

  rate: parseFloat(localStorage.getItem('folira_speech_rate') || '1.0'),
  pitch: 1.0,
  volume: 1.0,
  followNarration: true,
  highlightEnabled: true,

  sleepTimerMinutes: null,
  sleepTimerEndTime: null,
  error: null,

  initialiseVoices: async () => {
    try {
      await systemSpeechEngine.initialise();
      const voices = await systemSpeechEngine.getVoices();
      set({ availableVoices: voices });

      // Auto-select first confirmed local voice if none selected
      const currentVoice = get().selectedVoiceId;
      if (!currentVoice && voices.length > 0) {
        const defaultLocal = voices.find((v) => v.isLocal) || voices[0];
        set({ selectedVoiceId: defaultLocal.id });
      }
    } catch (err) {
      console.warn('Voice initialization error:', err);
    }
  },

  startListening: async (documentId: string, targetPage?: number) => {
    const { pdfDocProxy } = useReaderStore.getState();
    if (!pdfDocProxy) {
      useNotificationStore.getState().showToast('Open a document to start reading aloud.', 'info');
      return;
    }

    set({ status: 'extracting', documentId, error: null });
    await get().initialiseVoices();

    const restored = await get().restoreProgress(documentId);
    const startPage = targetPage || restored?.pageNumber || useReaderStore.getState().currentPage || 1;

    try {
      // Extract page text
      const pageData = await pdfTextExtractionService.extractPageText(pdfDocProxy, documentId, startPage);

      if (pageData.isScanned) {
        set({
          status: 'error',
          error: 'This page appears to be scanned and has no readable text.',
        });
        useNotificationStore.getState().showToast('This page appears to be scanned and has no readable text.', 'info');
        return;
      }

      const chunks = generateSpeechChunks(pageData.text, documentId, startPage);
      if (chunks.length === 0) {
        set({
          status: 'error',
          error: 'This page does not contain text that Folira can read aloud.',
        });
        return;
      }

      const chunkIndex = Math.min(Math.max(0, restored?.chunkIndex || 0), chunks.length - 1);

      set({
        currentPage: startPage,
        chunks,
        currentChunkIndex: chunkIndex,
        activeChunk: chunks[chunkIndex],
        status: 'paused',
      });

      // Synchronize reader view page
      if (get().followNarration) {
        useReaderStore.getState().setCurrentPage(startPage);
      }

      // Preload next page in background
      pdfTextExtractionService.preloadAdjacentPages(pdfDocProxy, documentId, startPage);

      // Start playing
      await get().play();
    } catch (err: any) {
      console.error('Failed to start read aloud:', err);
      set({
        status: 'error',
        error: 'Folira could not continue reading with this voice. Try another installed voice.',
      });
    }
  },

  play: async () => {
    const { chunks, currentChunkIndex, rate, pitch, volume, selectedVoiceId, followNarration, currentPage } = get();

    if (chunks.length === 0 || currentChunkIndex >= chunks.length) {
      await get().nextPage();
      return;
    }

    const chunk = chunks[currentChunkIndex];
    set({ status: 'playing', activeChunk: chunk });

    if (followNarration) {
      useReaderStore.getState().setCurrentPage(currentPage);
    }

    try {
      await systemSpeechEngine.speak(chunk, {
        rate,
        pitch,
        volume,
        voiceId: selectedVoiceId,
        onBoundary: (charIndex, charLength) => {
          set({ currentCharIndex: charIndex, currentCharLength: charLength || 0 });
        },
        onEnd: async () => {
          await get().saveProgress();

          const { currentChunkIndex: idx, chunks: currentChunks } = get();
          if (idx + 1 < currentChunks.length) {
            set({
              currentChunkIndex: idx + 1,
              activeChunk: currentChunks[idx + 1],
              currentCharIndex: 0,
            });
            await get().play();
          } else {
            // Reached end of page, advance to next page
            await get().nextPage();
          }
        },
        onError: (err) => {
          console.warn('Speech engine playback error:', err);
          set({ status: 'error', error: err });
        },
      });
    } catch {
      set({ status: 'error', error: 'Speech playback failed.' });
    }
  },

  pause: () => {
    systemSpeechEngine.pause();
    set({ status: 'paused' });
    get().saveProgress();
  },

  resume: () => {
    if (get().status === 'paused') {
      systemSpeechEngine.resume();
      set({ status: 'playing' });
    } else {
      get().play();
    }
  },

  stop: () => {
    systemSpeechEngine.stop();
    get().saveProgress();
    set({
      status: 'stopped',
      activeChunk: null,
      currentCharIndex: 0,
    });
  },

  nextSentence: async () => {
    const { currentChunkIndex, chunks } = get();
    if (currentChunkIndex + 1 < chunks.length) {
      systemSpeechEngine.stop();
      set({
        currentChunkIndex: currentChunkIndex + 1,
        activeChunk: chunks[currentChunkIndex + 1],
        currentCharIndex: 0,
      });
      await get().play();
    } else {
      await get().nextPage();
    }
  },

  prevSentence: async () => {
    const { currentChunkIndex, chunks } = get();
    if (currentChunkIndex > 0) {
      systemSpeechEngine.stop();
      set({
        currentChunkIndex: currentChunkIndex - 1,
        activeChunk: chunks[currentChunkIndex - 1],
        currentCharIndex: 0,
      });
      await get().play();
    } else {
      await get().prevPage();
    }
  },

  nextPage: async () => {
    const { documentId, currentPage } = get();
    const { totalPages, pdfDocProxy } = useReaderStore.getState();

    if (!documentId || !pdfDocProxy || currentPage >= totalPages) {
      systemSpeechEngine.stop();
      set({ status: 'completed', activeChunk: null });
      useNotificationStore.getState().showToast('Reached the end of the document.', 'info');
      return;
    }

    const nextPg = currentPage + 1;
    systemSpeechEngine.stop();
    await get().startListening(documentId, nextPg);
  },

  prevPage: async () => {
    const { documentId, currentPage } = get();
    if (!documentId || currentPage <= 1) return;

    const prevPg = currentPage - 1;
    systemSpeechEngine.stop();
    await get().startListening(documentId, prevPg);
  },

  setRate: (rate) => {
    const clamped = Math.max(0.5, Math.min(3.0, rate));
    localStorage.setItem('folira_speech_rate', clamped.toString());
    set({ rate: clamped });
  },

  setPitch: (pitch) => {
    const clamped = Math.max(0.5, Math.min(1.5, pitch));
    set({ pitch: clamped });
  },

  setVolume: (volume) => {
    const clamped = Math.max(0.0, Math.min(1.0, volume));
    set({ volume: clamped });
  },

  setSelectedVoice: (selectedVoiceId) => {
    localStorage.setItem('folira_selected_voice_id', selectedVoiceId);
    set({ selectedVoiceId });
  },

  setSelectedEngine: (selectedEngine) => set({ selectedEngine }),
  setFollowNarration: (followNarration) => set({ followNarration }),
  setHighlightEnabled: (highlightEnabled) => set({ highlightEnabled }),

  setSleepTimer: (minutes) => {
    if (sleepIntervalTimer) {
      clearInterval(sleepIntervalTimer);
      sleepIntervalTimer = null;
    }

    if (!minutes) {
      set({ sleepTimerMinutes: null, sleepTimerEndTime: null });
      return;
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime });

    sleepIntervalTimer = setInterval(() => {
      const now = Date.now();
      if (now >= endTime) {
        clearInterval(sleepIntervalTimer);
        sleepIntervalTimer = null;
        get().pause();
        set({ sleepTimerMinutes: null, sleepTimerEndTime: null });
        useNotificationStore.getState().showToast(`Sleep timer ended. Narration paused.`, 'info');
      }
    }, 1000);
  },

  saveProgress: async () => {
    const { documentId, currentPage, currentChunkIndex, activeChunk, selectedVoiceId, selectedEngine, rate, pitch, volume } = get();
    if (!documentId) return;

    try {
      const record: ReadAloudProgress = {
        documentId,
        pageNumber: currentPage,
        chunkIndex: currentChunkIndex,
        paragraphIndex: activeChunk?.paragraphIndex || 0,
        sentenceIndex: activeChunk?.sentenceIndex || 0,
        characterOffset: get().currentCharIndex,
        selectedVoiceId,
        selectedEngine,
        rate,
        pitch,
        volume,
        updatedAt: Date.now(),
      };
      await db.readAloudProgress.put(record);
    } catch (e) {
      console.warn('Failed to save read aloud progress:', e);
    }
  },

  restoreProgress: async (documentId: string) => {
    try {
      const record = await db.readAloudProgress.get(documentId);
      return record || null;
    } catch {
      return null;
    }
  },
}));

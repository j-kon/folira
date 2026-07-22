import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReaderStore } from '@/stores/useReaderStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { PdfCanvas } from '@/components/reader/PdfCanvas';
import { ReaderSidebar } from '@/components/reader/ReaderSidebar';
import { Button } from '@/components/common/Button';
import { ToastContainer } from '@/components/common/ToastContainer';
import { Loader2, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Bookmark, Sun, Moon } from 'lucide-react';

export const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    loadReaderSession,
    closeReaderSession,
    isLoading,
    error,
    pdfDocProxy,
    currentPage,
    totalPages,
    prevPage,
    nextPage,
    addBookmarkForCurrentPage,
    backgroundTheme,
    setBackgroundTheme,
  } = useReaderStore();

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useKeyboardShortcuts(true);

  // Auto-hide toolbar after 4 seconds of inactivity
  const handleUserActivity = () => {
    setIsToolbarVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 4000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (id) {
      loadReaderSession(id);
    }
    return () => {
      closeReaderSession();
    };
  }, [id, loadReaderSession, closeReaderSession]);

  // Apply reading theme class to page container
  const themeClass =
    backgroundTheme === 'night' || backgroundTheme === 'dark'
      ? 'theme-reader-night bg-[#151A17] text-[#F8F5EE]'
      : backgroundTheme === 'sepia'
      ? 'theme-reader-sepia bg-[#F2E4CB] text-[#3E2723]'
      : 'theme-reader-paper bg-[#F8F5EE] text-[#252A27]';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#151A17] text-[#252A27] dark:text-[#F8F5EE] p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2F6B4F] text-white flex items-center justify-center shadow-lg animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#252A27] dark:text-[#F8F5EE]">Opening Document</h2>
            <p className="text-xs text-[#7A857F] dark:text-[#8E9992] mt-1">
              Loading offline document stream...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pdfDocProxy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#151A17] text-[#252A27] dark:text-[#F8F5EE] p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] shadow-xl text-center flex flex-col items-center gap-4">
          <div className="p-3.5 rounded-full bg-[#FFEBEE] text-[#D32F2F] dark:bg-[#3E1A1A] dark:text-[#EF5350]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#252A27] dark:text-[#F8F5EE]">
              Unable to Open Document
            </h2>
            <p className="mt-2 text-sm text-[#525B56] dark:text-[#C0C8C3] leading-relaxed">
              {error || 'The requested PDF file could not be loaded from local device storage.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="mt-2"
          >
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden relative select-none ${themeClass}`}>
      {/* Desktop & Mobile Reader Toolbar */}
      <ReaderToolbar isVisible={isToolbarVisible} />

      {/* Main Canvas & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden relative" onClick={() => setIsToolbarVisible((prev) => !prev)}>
        <PdfCanvas pdfDoc={pdfDocProxy} pageNumber={currentPage} />
        <ReaderSidebar />
      </div>

      {/* Responsive Mobile Bottom Control Toolbar */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FFFDF8]/95 dark:bg-[#1E2420]/95 backdrop-blur-md border-t border-[#E8E5DD] dark:border-[#2D3630] flex items-center justify-around px-4 z-40 transition-transform duration-200 ${
          isToolbarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#252A27] dark:text-[#F8F5EE] disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-xs font-semibold text-[#525B56] dark:text-[#C0C8C3]">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#252A27] dark:text-[#F8F5EE] disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => addBookmarkForCurrentPage()}
          aria-label="Bookmark page"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#252A27] dark:text-[#F8F5EE]"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        <button
          onClick={() =>
            setBackgroundTheme(
              backgroundTheme === 'paper' ? 'sepia' : backgroundTheme === 'sepia' ? 'night' : 'paper'
            )
          }
          aria-label="Cycle reading theme"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#252A27] dark:text-[#F8F5EE]"
        >
          {backgroundTheme === 'night' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

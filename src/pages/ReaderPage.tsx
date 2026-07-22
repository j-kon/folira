import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReaderStore } from '@/stores/useReaderStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { PdfCanvas } from '@/components/reader/PdfCanvas';
import { ReaderSidebar } from '@/components/reader/ReaderSidebar';
import { Button } from '@/components/common/Button';
import { ToastContainer } from '@/components/common/ToastContainer';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

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
  } = useReaderStore();

  useKeyboardShortcuts(true);

  useEffect(() => {
    if (id) {
      loadReaderSession(id);
    }
    return () => {
      closeReaderSession();
    };
  }, [id, loadReaderSession, closeReaderSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-warm-bg)] dark:bg-[var(--color-dark-bg)] text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-emerald-accent)] text-white flex items-center justify-center shadow-lg animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Opening Document</h2>
            <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] mt-1">
              Loading offline document stream...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pdfDocProxy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-warm-bg)] dark:bg-[var(--color-dark-bg)] text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] shadow-xl text-center flex flex-col items-center gap-4">
          <div className="p-3.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
              Unable to Open Document
            </h2>
            <p className="mt-2 text-sm text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] leading-relaxed">
              {error || 'The requested PDF file could not be loaded from local storage.'}
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--color-warm-bg)] dark:bg-[var(--color-dark-bg)] text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] transition-colors">
      <ReaderToolbar />

      <div className="flex-1 flex overflow-hidden relative">
        <PdfCanvas pdfDoc={pdfDocProxy} pageNumber={currentPage} />
        <ReaderSidebar />
      </div>

      <ToastContainer />
    </div>
  );
};

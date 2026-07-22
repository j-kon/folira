import React from 'react';
import { BookOpen, ShieldCheck, WifiOff } from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { useDocumentStore } from '@/stores/useDocumentStore';

export const WelcomeScreen: React.FC = () => {
  const { importDocument, isUploading, uploadProgressMessage } = useDocumentStore();

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Brand Icon */}
      <div className="w-16 h-16 rounded-3xl bg-[var(--color-emerald-accent)] text-white flex items-center justify-center shadow-lg mb-6">
        <BookOpen className="w-9 h-9" />
      </div>

      {/* Wordmark & Tagline */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
        Folira
      </h1>
      <p className="mt-2 text-lg sm:text-xl font-medium text-[var(--color-emerald-accent)]">
        Read anything. Even offline.
      </p>

      {/* Explanation */}
      <p className="mt-4 text-sm sm:text-base text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] max-w-lg leading-relaxed">
        Folira is your private personal reading library. Import PDFs directly from your device and read seamlessly anywhere—no internet, accounts, or cloud required.
      </p>

      {/* Upload Zone */}
      <div className="mt-8 w-full">
        <Dropzone
          onFileSelect={importDocument}
          isUploading={isUploading}
          progressMessage={uploadProgressMessage}
        />
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
        <div className="p-4 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)] shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
              100% Offline Capable
            </h3>
            <p className="mt-0.5 text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
              All documents are stored locally in your browser so you can read anytime, anywhere.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
              Private & Local
            </h3>
            <p className="mt-0.5 text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
              Your files never leave your device. No cloud sync, trackers, or data collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Lock } from 'lucide-react';
import { Button } from './Button';

export interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  progressMessage?: string | null;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  isUploading = false,
  progressMessage = null,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
      // Reset input value so re-selecting the same file works
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      tabIndex={0}
      role="button"
      aria-label="Import PDF or EPUB document dropzone"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      className={`relative cursor-pointer group flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl transition-all duration-200 text-center ${
        isDragOver
          ? 'border-[var(--color-emerald-accent)] bg-[var(--color-emerald-light)] dark:bg-emerald-950/20 scale-[1.01]'
          : 'border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] hover:border-[var(--color-emerald-accent)] dark:hover:border-[var(--color-emerald-accent)]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf,application/epub+zip,.epub"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="w-16 h-16 rounded-2xl bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] flex items-center justify-center text-[var(--color-emerald-accent)] group-hover:scale-110 transition-transform duration-200 mb-4 shadow-xs">
        {isUploading ? (
          <FileText className="w-8 h-8 animate-pulse" />
        ) : (
          <UploadCloud className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
        {isUploading ? 'Importing document...' : 'Import your PDF or EPUB book'}
      </h3>

      <p className="mt-1.5 text-sm text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] max-w-sm leading-relaxed">
        {progressMessage || 'Drag and drop your PDF or EPUB here, or click to browse your device files.'}
      </p>

      {!isUploading && (
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Document File
          </Button>
        </div>
      )}

      {/* Privacy guarantee pill */}
      <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)]">
        <Lock className="w-3.5 h-3.5 text-[var(--color-emerald-accent)]" />
        <span>Your documents stay on this device.</span>
      </div>
    </div>
  );
};

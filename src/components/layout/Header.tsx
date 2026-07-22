import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Plus, X } from 'lucide-react';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { ThemeToggle } from './ThemeToggle';
import { OfflineBadge } from '../common/OfflineBadge';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, importDocument, isUploading } = useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importDocument(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-warm-bg)]/80 dark:bg-[var(--color-dark-bg)]/80 backdrop-blur-md border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emerald-accent)] rounded-lg px-1"
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--color-emerald-accent)] text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Folira</span>
        </Link>

        {/* Search Field */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library documents..."
              className="w-full pl-9 pr-9 py-1.5 text-sm bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-xl text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald-accent)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <OfflineBadge />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="hidden sm:inline">Import</span> Document
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

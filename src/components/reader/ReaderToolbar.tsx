import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  Sidebar,
  Sun,
  Moon,
  Search,
  Maximize,
} from 'lucide-react';
import { useReaderStore } from '@/stores/useReaderStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export const ReaderToolbar: React.FC = () => {
  const navigate = useNavigate();

  const {
    document: doc,
    currentPage,
    totalPages,
    setCurrentPage,
    nextPage,
    prevPage,
    zoomLevel,
    zoomIn,
    zoomOut,
    setZoomLevel,
    backgroundTheme,
    setBackgroundTheme,
    isSidebarOpen,
    toggleSidebar,
    isFullscreen,
    toggleFullscreen,
    addBookmarkForCurrentPage,
    bookmarks,
  } = useReaderStore();

  const [pageInput, setPageInput] = useState<string>(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleSearchPlaceholder = () => {
    useNotificationStore.getState().showToast('Text search inside PDF is coming soon!', 'info');
  };

  return (
    <div className="h-14 px-3 sm:px-6 bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between gap-2 shadow-xs shrink-0 select-none z-30">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to Library"
          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emerald-accent)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2
          title={doc?.name || 'Document Reader'}
          className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] truncate max-w-[150px] sm:max-w-xs md:max-w-md"
        >
          {doc?.name || 'Loading document...'}
        </h2>
      </div>

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5 text-xs font-medium">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageSubmit}
            aria-label="Current Page Number"
            className="w-10 text-center py-1 bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-md font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald-accent)]"
          />
          <span className="text-gray-400">/ {totalPages}</span>
        </form>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Controls & Sidebar */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-1 border-r border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pr-2">
          <button
            onClick={zoomOut}
            aria-label="Zoom out"
            className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium w-12 text-center text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={zoomIn}
            aria-label="Zoom in"
            className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel('fit-width')}
            aria-label="Fit width"
            title="Fit Width"
            className="p-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors ml-1"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Bookmark button */}
        <button
          onClick={() => addBookmarkForCurrentPage()}
          aria-label="Bookmark page"
          title="Bookmark Page (B)"
          className={`p-1.5 rounded-lg transition-colors ${
            isCurrentPageBookmarked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
              : 'text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Search Placeholder button */}
        <button
          onClick={handleSearchPlaceholder}
          aria-label="Search document"
          title="Search Document (Coming soon)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Reading Background Theme Toggle */}
        <div className="hidden sm:flex items-center gap-1 border-l border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pl-2">
          <button
            onClick={() => setBackgroundTheme('light')}
            title="Light reading mode"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'light'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBackgroundTheme('sepia')}
            title="Sepia warm mode"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'sepia'
                ? 'bg-[#F4ECD8] text-[#5F4B32] font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="w-4 h-4 font-bold text-xs flex items-center justify-center">S</span>
          </button>
          <button
            onClick={() => setBackgroundTheme('dark')}
            title="Dark reading mode"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'dark'
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          aria-label="Toggle Fullscreen"
          title="Fullscreen Mode"
          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className={`p-1.5 rounded-lg transition-colors ${
            isSidebarOpen
              ? 'bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/40'
              : 'text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)]'
          }`}
        >
          <Sidebar className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

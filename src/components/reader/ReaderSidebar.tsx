import React from 'react';
import {
  X,
  Info,
  Grid,
  Bookmark,
  ListTree,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useReaderStore } from '@/stores/useReaderStore';
import { formatFileSize, formatDate } from '@/utils/formatters';

export const ReaderSidebar: React.FC = () => {
  const {
    document: doc,
    isSidebarOpen,
    toggleSidebar,
    activeSidebarTab,
    setActiveSidebarTab,
    totalPages,
    currentPage,
    setCurrentPage,
    bookmarks,
    deleteBookmark,
  } = useReaderStore();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-80 h-[calc(100vh-3.5rem)] bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border-l border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex flex-col shrink-0 z-20 shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSidebarTab('info')}
            title="Document Details"
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              activeSidebarTab === 'info'
                ? 'bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/40 font-semibold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSidebarTab('thumbnails')}
            title="Page Thumbnails"
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              activeSidebarTab === 'thumbnails'
                ? 'bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/40 font-semibold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSidebarTab('bookmarks')}
            title="Bookmarks"
            className={`p-2 rounded-lg text-xs font-medium transition-colors relative ${
              activeSidebarTab === 'bookmarks'
                ? 'bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/40 font-semibold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-emerald-accent)]" />
            )}
          </button>
          <button
            onClick={() => setActiveSidebarTab('toc')}
            title="Table of Contents"
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              activeSidebarTab === 'toc'
                ? 'bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/40 font-semibold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ListTree className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          aria-label="Close sidebar"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* INFO TAB */}
        {activeSidebarTab === 'info' && (
          <div className="flex flex-col gap-4 text-xs">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Document Information
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Title
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] break-words">
                  {doc?.name}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Original File Name
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] break-all">
                  {doc?.originalName}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Total Pages
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                  {totalPages} pages
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  File Size
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                  {doc ? formatFileSize(doc.fileSize) : '-'}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Last Opened
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                  {doc ? formatDate(doc.lastOpenedAt) : '-'}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Import Date
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                  {doc ? formatDate(doc.createdAt) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* THUMBNAILS TAB */}
        {activeSidebarTab === 'thumbnails' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Page Thumbnails
            </h3>

            <div className="grid grid-cols-3 gap-2 mt-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`aspect-[3/4] p-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    pageNum === currentPage
                      ? 'border-[var(--color-emerald-accent)] bg-[var(--color-emerald-light)] text-[var(--color-emerald-accent)] dark:bg-emerald-950/60 ring-2 ring-[var(--color-emerald-accent)]'
                      : 'border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] text-gray-600 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mb-1 opacity-60" />
                  <span>Pg {pageNum}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeSidebarTab === 'bookmarks' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Bookmarks ({bookmarks.length})
            </h3>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] py-4 text-center">
                No bookmarks added yet. Press 'B' or click the bookmark button in the toolbar to save a page.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => setCurrentPage(bm.pageNumber)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] hover:border-[var(--color-emerald-accent)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] block truncate">
                          {bm.label}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Page {bm.pageNumber} • {formatDate(bm.createdAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBookmark(bm.id);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOC TAB */}
        {activeSidebarTab === 'toc' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Table of Contents
            </h3>
            <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] py-4 text-center">
              Structured Table of Contents extraction will be available in an upcoming update.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

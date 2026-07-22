import React, { useEffect, useState } from 'react';
import {
  X,
  Info,
  Grid,
  Bookmark,
  ListTree,
  Trash2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useReaderStore } from '@/stores/useReaderStore';
import { pdfService } from '@/services/pdfService';
import type { TocOutlineItem } from '@/types/search';
import { formatFileSize, formatDate } from '@/utils/formatters';

interface OutlineItemProps {
  item: TocOutlineItem;
  onNavigate: (page: number) => void;
  depth?: number;
}

const OutlineNodeItem: React.FC<OutlineItemProps> = ({ item, onNavigate, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.items && item.items.length > 0;

  return (
    <div className="flex flex-col gap-1" style={{ paddingLeft: `${depth * 12}px` }}>
      <div
        onClick={() => onNavigate(item.pageNumber)}
        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF8F5] dark:hover:bg-[#151A17] border border-transparent hover:border-[#E8E5DD] dark:hover:border-[#2D3630] cursor-pointer transition-colors group"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shrink-0"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          <span className="text-xs font-medium text-[#252A27] dark:text-[#F8F5EE] group-hover:text-[#2F6B4F] dark:group-hover:text-[#3D8B67] truncate">
            {item.title}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-[#7A857F] dark:text-[#8E9992] px-1.5 py-0.5 rounded bg-[#E8E5DD]/50 dark:bg-[#2D3630] shrink-0 ml-1">
          P. {item.pageNumber}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col gap-1">
          {item.items!.map((child) => (
            <OutlineNodeItem key={child.id} item={child} onNavigate={onNavigate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

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
    pdfDocProxy,
  } = useReaderStore();

  const [outlineItems, setOutlineItems] = useState<TocOutlineItem[]>([]);
  const [isLoadingToc, setIsLoadingToc] = useState<boolean>(false);

  useEffect(() => {
    if (activeSidebarTab === 'toc' && pdfDocProxy) {
      setIsLoadingToc(true);
      pdfService.getOutline(pdfDocProxy).then((items) => {
        setOutlineItems(items);
        setIsLoadingToc(false);
      }).catch(() => {
        setIsLoadingToc(false);
      });
    }
  }, [activeSidebarTab, pdfDocProxy]);

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
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* INFO TAB */}
        {activeSidebarTab === 'info' && doc && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Document Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Title
                </span>
                <span className="font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] break-words">
                  {doc.name}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mb-0.5">
                  Original Filename
                </span>
                <span className="font-mono text-gray-600 dark:text-gray-300 break-all">{doc.originalName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)]">
                <div>
                  <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                    File Size
                  </span>
                  <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
                </div>
                <div>
                  <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                    Total Pages
                  </span>
                  <span className="font-medium">{totalPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)]">
                <div>
                  <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                    Import Date
                  </span>
                  <span className="font-medium">{formatDate(doc.createdAt)}</span>
                </div>
                <div>
                  <span className="text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                    Last Opened
                  </span>
                  <span className="font-medium">
                    {doc.lastOpenedAt ? formatDate(doc.lastOpenedAt) : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THUMBNAILS TAB */}
        {activeSidebarTab === 'thumbnails' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-2">
              Page Navigator ({totalPages})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    currentPage === pageNum
                      ? 'border-[#2F6B4F] bg-[#2F6B4F]/10 dark:bg-[#3D8B67]/20 font-bold text-[#2F6B4F] dark:text-[#3D8B67] shadow-sm'
                      : 'border-[#E8E5DD] dark:border-[#2D3630] hover:border-[#2F6B4F] text-[#525B56] dark:text-[#C0C8C3]'
                  }`}
                >
                  <div className="w-12 h-16 bg-white dark:bg-[#151A17] border border-[#E8E5DD] dark:border-[#2D3630] rounded shadow-2xs flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#7A857F]" />
                  </div>
                  <span className="text-xs">Page {pageNum}</span>
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

            {isLoadingToc ? (
              <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] py-4 text-center">
                Extracting PDF Table of Contents...
              </p>
            ) : outlineItems.length === 0 ? (
              <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] py-4 text-center">
                This document does not contain an embedded structural Table of Contents.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {outlineItems.map((item) => (
                  <OutlineNodeItem
                    key={item.id}
                    item={item}
                    onNavigate={(page) => setCurrentPage(page)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

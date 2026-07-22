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
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { useReaderStore } from '@/stores/useReaderStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';

export interface ReaderToolbarProps {
  isVisible?: boolean;
  onOpenListen?: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({ isVisible = true, onOpenListen }) => {
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
    lastSavedAt,
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
    <header
      className={`h-14 px-3 sm:px-6 bg-[#FFFDF8] dark:bg-[#1E2420] border-b border-[#E8E5DD] dark:border-[#2D3630] flex items-center justify-between gap-2 shadow-xs shrink-0 select-none z-30 transition-all duration-200 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Left: Back & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <IconButton
          aria-label="Back to Library"
          icon={<ArrowLeft className="w-5 h-5" />}
          variant="ghost"
          onClick={() => navigate('/')}
        />

        <div className="flex items-center gap-2 min-w-0">
          <h2
            title={doc?.name || 'Document Reader'}
            className="font-editorial text-sm font-semibold text-[#252A27] dark:text-[#F8F5EE] truncate max-w-[140px] sm:max-w-xs md:max-w-md"
          >
            {doc?.name || 'Loading document...'}
          </h2>
          {lastSavedAt && (
            <Badge variant="forest" className="hidden lg:inline-flex text-[10px] py-0 px-2 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <IconButton
          aria-label="Previous Page"
          icon={<ChevronLeft className="w-5 h-5" />}
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={prevPage}
        />

        <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5 text-xs font-medium">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageSubmit}
            aria-label="Current Page Number"
            className="w-10 text-center py-1 bg-[#F8F5EE] dark:bg-[#151A17] border border-[#E8E5DD] dark:border-[#2D3630] rounded-md font-semibold text-[#252A27] dark:text-[#F8F5EE] focus:outline-none focus:ring-1 focus:ring-[#2F6B4F]"
          />
          <span className="text-[#7A857F]">/ {totalPages}</span>
        </form>

        <IconButton
          aria-label="Next Page"
          icon={<ChevronRight className="w-5 h-5" />}
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={nextPage}
        />
      </div>

      {/* Right: Controls & Sidebar */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-1 border-r border-[#E8E5DD] dark:border-[#2D3630] pr-2">
          <IconButton aria-label="Zoom out" icon={<ZoomOut className="w-4 h-4" />} onClick={zoomOut} />
          <span className="text-xs font-medium w-12 text-center text-[#525B56] dark:text-[#C0C8C3]">
            {Math.round(zoomLevel * 100)}%
          </span>
          <IconButton aria-label="Zoom in" icon={<ZoomIn className="w-4 h-4" />} onClick={zoomIn} />

          <IconButton
            aria-label="Fit Width"
            icon={<Maximize className="w-4 h-4" />}
            onClick={() => setZoomLevel('fit-width')}
          />
        </div>

        {/* Bookmark button */}
        <IconButton
          aria-label="Bookmark page"
          icon={<Bookmark className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-[#C89545] text-[#C89545]' : ''}`} />}
          variant={isCurrentPageBookmarked ? 'secondary' : 'ghost'}
          onClick={() => addBookmarkForCurrentPage()}
        />

        {/* Listen / Read Aloud Button */}
        {onOpenListen && (
          <IconButton
            aria-label="Read Aloud Listen Panel"
            title="Read Aloud (Listen)"
            icon={<Volume2 className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />}
            variant="ghost"
            onClick={onOpenListen}
          />
        )}

        {/* Search Placeholder button */}
        <IconButton
          aria-label="Search document"
          icon={<Search className="w-4 h-4" />}
          onClick={handleSearchPlaceholder}
        />

        {/* Reading Background Theme Toggle */}
        <div className="hidden sm:flex items-center gap-1 border-l border-[#E8E5DD] dark:border-[#2D3630] pl-2">
          <button
            onClick={() => setBackgroundTheme('paper')}
            title="Paper theme"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'paper' || backgroundTheme === 'light'
                ? 'bg-[#F8F5EE] text-[#252A27] font-semibold border border-[#E8E5DD]'
                : 'text-[#7A857F] hover:text-[#252A27]'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBackgroundTheme('sepia')}
            title="Sepia theme"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'sepia'
                ? 'bg-[#F2E4CB] text-[#3E2723] font-semibold border border-[#C89545]/40'
                : 'text-[#7A857F] hover:text-[#252A27]'
            }`}
          >
            <span className="w-4 h-4 font-bold text-xs flex items-center justify-center">S</span>
          </button>
          <button
            onClick={() => setBackgroundTheme('night')}
            title="Night theme"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              backgroundTheme === 'night' || backgroundTheme === 'dark'
                ? 'bg-[#151A17] text-[#F8F5EE] font-semibold border border-[#2D3630]'
                : 'text-[#7A857F] hover:text-[#252A27]'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen toggle */}
        <IconButton
          aria-label="Toggle Fullscreen"
          icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          onClick={toggleFullscreen}
        />

        {/* Sidebar toggle */}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<Sidebar className="w-4 h-4" />}
          variant={isSidebarOpen ? 'secondary' : 'ghost'}
          onClick={toggleSidebar}
        />
      </div>
    </header>
  );
};

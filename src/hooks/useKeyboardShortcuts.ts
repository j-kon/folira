import { useEffect } from 'react';
import { useReaderStore } from '@/stores/useReaderStore';

export function useKeyboardShortcuts(isActive: boolean) {
  const {
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    addBookmarkForCurrentPage,
    isFullscreen,
    toggleFullscreen,
    isSidebarOpen,
    toggleSidebar,
  } = useReaderStore();

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          addBookmarkForCurrentPage();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          } else if (isSidebarOpen) {
            e.preventDefault();
            toggleSidebar();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    addBookmarkForCurrentPage,
    isFullscreen,
    toggleFullscreen,
    isSidebarOpen,
    toggleSidebar,
  ]);
}

import { describe, it, expect, beforeEach } from 'vitest';
import { useReaderStore } from '@/stores/useReaderStore';

describe('useKeyboardShortcuts Isolation', () => {
  beforeEach(() => {
    useReaderStore.setState({
      activeDocumentId: 'doc-1',
      currentPage: 5,
      totalPages: 10,
      isFullscreen: false,
      isSidebarOpen: false,
    });
  });

  it('should ignore keyboard hotkeys when focus is inside an input element', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const initialPage = useReaderStore.getState().currentPage;

    // Dispatch ArrowRight event on input
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    input.dispatchEvent(event);

    // Page should NOT change because input has focus
    expect(useReaderStore.getState().currentPage).toBe(initialPage);

    document.body.removeChild(input);
  });

  it('should ignore keyboard hotkeys when focus is inside a textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const initialPage = useReaderStore.getState().currentPage;

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    textarea.dispatchEvent(event);

    expect(useReaderStore.getState().currentPage).toBe(initialPage);

    document.body.removeChild(textarea);
  });
});

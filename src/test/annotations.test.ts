import { describe, it, expect } from 'vitest';
import { useAnnotationStore } from '../stores/useAnnotationStore';

describe('useAnnotationStore', () => {
  it('should initialize with empty annotations list', () => {
    const state = useAnnotationStore.getState();
    expect(state.annotations).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should format Markdown export correctly', () => {
    useAnnotationStore.setState({
      annotations: [
        {
          id: 'test-1',
          documentId: 'doc-1',
          pageNumber: 3,
          selectedText: 'Offline reading is fast and private.',
          color: 'forest',
          note: 'Remember this core value proposition.',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
        },
      ],
    });

    const md = useAnnotationStore.getState().exportAsMarkdown('Sample PDF');
    expect(md).toContain('# Reading Notes & Highlights: Sample PDF');
    expect(md).toContain('## Page 3');
    expect(md).toContain('> "Offline reading is fast and private."');
    expect(md).toContain('**Note**: Remember this core value proposition.');
  });
});

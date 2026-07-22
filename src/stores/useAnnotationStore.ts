import { create } from 'zustand';
import { db } from '@/services/database';
import type { AnnotationRecord, AnnotationColor } from '@/types/document';
import { v4 as uuidv4 } from 'uuid';

interface AnnotationState {
  annotations: AnnotationRecord[];
  isLoading: boolean;

  loadAnnotations: (documentId: string) => Promise<void>;
  addAnnotation: (payload: {
    documentId: string;
    pageNumber: number;
    selectedText: string;
    color: AnnotationColor;
    note?: string;
  }) => Promise<AnnotationRecord>;
  updateAnnotation: (id: string, note: string) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  exportAsMarkdown: (docName: string) => string;
  exportAsJson: (docName: string) => string;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  isLoading: false,

  loadAnnotations: async (documentId: string) => {
    set({ isLoading: true });
    try {
      const records = await db.annotations.where({ documentId }).sortBy('pageNumber');
      set({ annotations: records, isLoading: false });
    } catch (err) {
      console.error('Failed to load annotations:', err);
      set({ annotations: [], isLoading: false });
    }
  },

  addAnnotation: async ({ documentId, pageNumber, selectedText, color, note }) => {
    const now = Date.now();
    const record: AnnotationRecord = {
      id: uuidv4(),
      documentId,
      pageNumber,
      selectedText: selectedText.trim(),
      color,
      note: note?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await db.annotations.put(record);

    set((state) => ({
      annotations: [...state.annotations, record].sort((a, b) => a.pageNumber - b.pageNumber),
    }));

    return record;
  },

  updateAnnotation: async (id: string, note: string) => {
    const now = Date.now();
    await db.annotations.update(id, { note: note.trim(), updatedAt: now });

    set((state) => ({
      annotations: state.annotations.map((item) =>
        item.id === id ? { ...item, note: note.trim(), updatedAt: now } : item
      ),
    }));
  },

  deleteAnnotation: async (id: string) => {
    await db.annotations.delete(id);

    set((state) => ({
      annotations: state.annotations.filter((item) => item.id !== id),
    }));
  },

  exportAsMarkdown: (docName: string) => {
    const { annotations } = get();
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# Reading Notes & Highlights: ${docName}\n`;
    md += `*Exported from Folira on ${dateStr}*\n\n---\n\n`;

    if (annotations.length === 0) {
      md += `*No notes or highlights recorded yet.*\n`;
      return md;
    }

    const grouped = annotations.reduce((acc, curr) => {
      acc[curr.pageNumber] = acc[curr.pageNumber] || [];
      acc[curr.pageNumber].push(curr);
      return acc;
    }, {} as Record<number, AnnotationRecord[]>);

    Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((pageNum) => {
        md += `## Page ${pageNum}\n\n`;
        grouped[pageNum].forEach((item) => {
          md += `> "${item.selectedText}"\n\n`;
          if (item.note) {
            md += `**Note**: ${item.note}\n\n`;
          }
        });
      });

    return md;
  },

  exportAsJson: (docName: string) => {
    const { annotations } = get();
    return JSON.stringify(
      {
        documentName: docName,
        exportedAt: new Date().toISOString(),
        totalAnnotations: annotations.length,
        annotations,
      },
      null,
      2
    );
  },
}));

import type { SpeechChunk } from '@/types/readAloud';
import { normalizeText } from './textNormalizer';

export function splitIntoSentences(text: string): string[] {
  if (!text.trim()) return [];

  // Try Intl.Segmenter if supported by environment
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
      const segments = Array.from(segmenter.segment(text));
      const sentences = segments.map((s) => s.segment.trim()).filter((s) => s.length > 0);
      if (sentences.length > 0) return sentences;
    } catch {
      // Fallback to regex
    }
  }

  // Fallback regex sentence splitter
  // Split on sentence-ending punctuation followed by space or quote
  const rawSentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/g);
  return rawSentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

export function generateSpeechChunks(
  rawPageText: string,
  documentId: string,
  pageNumber: number
): SpeechChunk[] {
  const normalized = normalizeText(rawPageText);
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const chunks: SpeechChunk[] = [];

  let globalOffset = 0;
  let chunkCounter = 0;

  paragraphs.forEach((paragraphText, pIndex) => {
    const sentences = splitIntoSentences(paragraphText);

    sentences.forEach((sentenceText, sIndex) => {
      const startOffset = globalOffset;
      const endOffset = startOffset + sentenceText.length;
      globalOffset = endOffset + 1; // +1 for trailing space/newline

      chunks.push({
        id: `${documentId}_p${pageNumber}_c${chunkCounter++}`,
        documentId,
        pageNumber,
        paragraphIndex: pIndex,
        sentenceIndex: sIndex,
        text: sentenceText,
        startOffset,
        endOffset,
      });
    });
  });

  return chunks;
}

import { describe, it, expect } from 'vitest';
import { normalizeText } from '../services/readAloud/textNormalizer';
import { splitIntoSentences, generateSpeechChunks } from '../services/readAloud/speechChunker';

describe('Text Normalization Pipeline', () => {
  it('should repair hyphenated words split across lines', () => {
    const input = 'This is a long-\nstanding issue in compu-\nter science.';
    const normalized = normalizeText(input);
    expect(normalized).toBe('This is a longstanding issue in computer science.');
  });

  it('should remove standalone page headers and footers', () => {
    const input = 'Page 12 of 100\nIntroduction to Folira\n\nChapter 1';
    const normalized = normalizeText(input);
    expect(normalized).toContain('Introduction to Folira');
    expect(normalized).not.toContain('Page 12 of 100');
  });

  it('should normalize ligatures and multiple spaces', () => {
    const input = 'The ﬁrst  ﬂower  in  spring.';
    const normalized = normalizeText(input);
    expect(normalized).toBe('The first flower in spring.');
  });
});

describe('Sentence Segmentation & Speech Chunking', () => {
  it('should split text into distinct sentences', () => {
    const text = 'Folira is private. It works offline! Have fun reading.';
    const sentences = splitIntoSentences(text);
    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toBe('Folira is private.');
    expect(sentences[1]).toBe('It works offline!');
  });

  it('should generate structured SpeechChunk objects for a page', () => {
    const rawText = 'First sentence of paragraph 1.\n\nSecond paragraph sentence.';
    const chunks = generateSpeechChunks(rawText, 'doc-abc', 2);

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0].documentId).toBe('doc-abc');
    expect(chunks[0].pageNumber).toBe(2);
    expect(chunks[0].sentenceIndex).toBe(0);
    expect(chunks[0].text).toContain('First sentence');
  });
});

/**
 * Text Normalization Pipeline for Folira Read Aloud
 * Prepares extracted raw PDF page text for natural speech synthesis.
 */

export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Unicode Normalization (decompose and recompose ligatures)
  text = text.normalize('NFKC');

  // Replace common ligatures explicitly if NFKC leaves any
  text = text
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl');

  // 2. Repair hyphenated words split across lines (e.g. "com-\nputer" -> "computer")
  text = text.replace(/(\b[a-zA-Z]+)-\s*\n\s*([a-zA-Z]+\b)/g, '$1$2');

  // 3. Remove standalone page numbers or headers/footers (e.g. "Page 12 of 150" or trailing page numbers)
  text = text.replace(/Page\s+\d+(\s+of\s+\d+)?/gi, '');
  text = text.replace(/^\s*\d+\s*$/gm, '');

  // 4. Normalize line breaks inside sentences while preserving paragraph breaks
  // Convert double/multiple newlines to paragraph token
  text = text.replace(/\n\s*\n+/g, ' [[PARAGRAPH]] ');

  // Single newlines within text -> space
  text = text.replace(/\n+/g, ' ');

  // 5. Normalize whitespace (collapse multiple spaces/tabs into single space)
  text = text.replace(/[ \t]+/g, ' ');

  // 6. Restore paragraph tokens
  text = text.replace(/\s*\[\[PARAGRAPH\]\]\s*/g, '\n\n');

  // 7. Clean up surrounding whitespace
  return text.trim();
}

import type * as pdfjsLib from 'pdfjs-dist';

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
  hasText: boolean;
  isScanned: boolean;
  itemCount: number;
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

class PdfTextExtractionService {
  private cache = new Map<string, ExtractedPageText>();
  private activeDocId: string | null = null;
  private isCancelled = false;

  public setDocumentContext(documentId: string) {
    if (this.activeDocId !== documentId) {
      this.cache.clear();
      this.activeDocId = documentId;
    }
    this.isCancelled = false;
  }

  public cancelExtraction() {
    this.isCancelled = true;
  }

  public clearCache() {
    this.cache.clear();
    this.activeDocId = null;
  }

  public async extractPageText(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    documentId: string,
    pageNumber: number
  ): Promise<ExtractedPageText> {
    const cacheKey = `${documentId}_p${pageNumber}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const items = textContent.items as Array<{ str?: string }>;
      const rawStrings = items.map((item) => item.str || '').filter(Boolean);
      const fullText = rawStrings.join(' ');
      const trimmed = fullText.trim();
      const itemCount = items.length;

      const isScanned = itemCount === 0 || trimmed.length === 0;

      const result: ExtractedPageText = {
        pageNumber,
        text: fullText,
        hasText: !isScanned,
        isScanned,
        itemCount,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error extracting text for page ${pageNumber}:`, error);
      const fallback: ExtractedPageText = {
        pageNumber,
        text: '',
        hasText: false,
        isScanned: true,
        itemCount: 0,
      };
      return fallback;
    }
  }

  public async extractPageRange(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    documentId: string,
    startPage: number,
    endPage: number,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<ExtractedPageText[]> {
    this.setDocumentContext(documentId);
    const results: ExtractedPageText[] = [];
    const totalToExtract = Math.max(1, endPage - startPage + 1);

    for (let p = startPage; p <= endPage; p++) {
      if (this.isCancelled) break;

      const pageResult = await this.extractPageText(pdfDoc, documentId, p);
      results.push(pageResult);

      if (onProgress) {
        onProgress({
          currentPage: p,
          totalPages: pdfDoc.numPages,
          percent: Math.round((results.length / totalToExtract) * 100),
        });
      }
    }

    return results;
  }

  public async preloadAdjacentPages(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    documentId: string,
    currentPage: number
  ): Promise<void> {
    this.setDocumentContext(documentId);
    const totalPages = pdfDoc.numPages;

    // Current page
    await this.extractPageText(pdfDoc, documentId, currentPage);

    // Pre-extract next page
    if (currentPage < totalPages && !this.isCancelled) {
      await this.extractPageText(pdfDoc, documentId, currentPage + 1);
    }

    // Pre-extract previous page
    if (currentPage > 1 && !this.isCancelled) {
      await this.extractPageText(pdfDoc, documentId, currentPage - 1);
    }
  }
}

export const pdfTextExtractionService = new PdfTextExtractionService();

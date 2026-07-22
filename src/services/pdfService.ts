import * as pdfjsLib from 'pdfjs-dist';
import workerRawCode from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';
import type { TocOutlineItem, SearchMatch } from '@/types/search';

// Create an inline Blob URL for PDF.js worker so offline dev/prod loading requires zero network calls
const workerBlob = new Blob([workerRawCode], { type: 'text/javascript' });
const workerBlobUrl = URL.createObjectURL(workerBlob);

pdfjsLib.GlobalWorkerOptions.workerSrc = workerBlobUrl;

export interface RenderPageResult {
  renderTask: pdfjsLib.RenderTask;
  width: number;
  height: number;
}

export const pdfService = {
  async loadDocument(blob: Blob): Promise<pdfjsLib.PDFDocumentProxy> {
    const arrayBuffer = await blob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    return loadingTask.promise;
  },

  async extractPageCount(blob: Blob): Promise<number> {
    const pdfDoc = await this.loadDocument(blob);
    return pdfDoc.numPages;
  },

  async generateThumbnail(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<string | undefined> {
    try {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return undefined;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      } as unknown as Parameters<pdfjsLib.PDFPageProxy['render']>[0]).promise;

      return canvas.toDataURL('image/jpeg', 0.75);
    } catch {
      return undefined;
    }
  },

  async getOutline(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<TocOutlineItem[]> {
    try {
      const rawOutline = await pdfDoc.getOutline();
      if (!rawOutline || !Array.isArray(rawOutline)) return [];

      const parseNode = async (nodes: any[]): Promise<TocOutlineItem[]> => {
        const result: TocOutlineItem[] = [];
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          let pageNumber = 1;

          if (node.dest) {
            try {
              let explicitDest = node.dest;
              if (typeof explicitDest === 'string') {
                explicitDest = await pdfDoc.getDestination(explicitDest);
              }
              if (Array.isArray(explicitDest) && explicitDest[0]) {
                const pageIndex = await pdfDoc.getPageIndex(explicitDest[0]);
                pageNumber = pageIndex + 1;
              }
            } catch (err) {
              console.warn('Could not resolve destination page index:', err);
            }
          }

          const children = node.items && node.items.length > 0 ? await parseNode(node.items) : undefined;

          result.push({
            id: `outline-${i}-${Math.random().toString(36).substring(2, 7)}`,
            title: node.title || 'Untitled Section',
            pageNumber,
            dest: node.dest,
            items: children,
          });
        }
        return result;
      };

      return await parseNode(rawOutline);
    } catch (err) {
      console.warn('Failed to parse PDF document outline:', err);
      return [];
    }
  },

  async searchDocumentText(pdfDoc: pdfjsLib.PDFDocumentProxy, query: string): Promise<SearchMatch[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const matches: SearchMatch[] = [];
    let matchIdCount = 0;

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const fullPageText = textContent.items.map((item: any) => item.str).join(' ');
        const lowerPageText = fullPageText.toLowerCase();

        let startIndex = 0;
        let pageMatchCount = 0;

        while ((startIndex = lowerPageText.indexOf(trimmed, startIndex)) !== -1) {
          matchIdCount++;
          pageMatchCount++;

          const snippetStart = Math.max(0, startIndex - 25);
          const snippetEnd = Math.min(fullPageText.length, startIndex + trimmed.length + 25);
          const snippet = fullPageText.slice(snippetStart, snippetEnd);

          matches.push({
            id: `match-${matchIdCount}`,
            pageNumber: pageNum,
            textSnippet: snippet,
            matchIndex: matchIdCount,
            totalMatchesOnPage: pageMatchCount,
          });

          startIndex += trimmed.length;
        }
      } catch (err) {
        console.warn(`Text search error on page ${pageNum}:`, err);
      }
    }

    return matches;
  },

  async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.0
  ): Promise<RenderPageResult> {
    const page = await pdfDoc.getPage(pageNumber);
    const pixelRatio = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * pixelRatio });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const unscaledViewport = page.getViewport({ scale: 1.0 });
    canvas.style.width = `${unscaledViewport.width * scale}px`;
    canvas.style.height = `${unscaledViewport.height * scale}px`;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');

    context.clearRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    } as unknown as Parameters<pdfjsLib.PDFPageProxy['render']>[0];

    const renderTask = page.render(renderContext);

    return {
      renderTask,
      width: unscaledViewport.width,
      height: unscaledViewport.height,
    };
  },
};

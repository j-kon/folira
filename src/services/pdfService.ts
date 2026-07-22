import * as pdfjsLib from 'pdfjs-dist';
import workerRawCode from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';

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

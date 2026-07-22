import React, { useEffect, useRef, useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { pdfService } from '@/services/pdfService';
import { useReaderStore } from '@/stores/useReaderStore';
import { Loader2 } from 'lucide-react';

export interface PdfCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({ pdfDoc, pageNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const { zoomLevel, zoomMode, backgroundTheme } = useReaderStore();

  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || !pdfDoc || !containerRef.current) return;
      setIsRendering(true);
      setRenderError(null);

      try {
        let computedScale = zoomLevel;

        if (zoomMode === 'fit-width' && containerRef.current) {
          const page = await pdfDoc.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.0 });
          const containerWidth = containerRef.current.clientWidth - 48; // padding margin
          if (containerWidth > 0) {
            computedScale = containerWidth / viewport.width;
          }
        }

        if (!isCancelled && canvasRef.current) {
          await pdfService.renderPageToCanvas(
            pdfDoc,
            pageNumber,
            canvasRef.current,
            computedScale
          );
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Page render error:', err);
          setRenderError('Could not render this page.');
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, zoomLevel, zoomMode]);

  const bgStyles = {
    light: 'bg-white shadow-md',
    sepia: 'bg-[#FAF4E8] shadow-md border-[#E6DCB8]',
    dark: 'bg-[#1C1E24] text-white shadow-xl border-gray-800',
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full overflow-auto flex flex-col items-center p-4 sm:p-8 relative select-none"
    >
      {isRendering && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium animate-in fade-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Rendering page {pageNumber}...</span>
        </div>
      )}

      {renderError ? (
        <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 my-auto">
          <p className="font-semibold text-sm">{renderError}</p>
        </div>
      ) : (
        <div className={`transition-all duration-150 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800/80 ${bgStyles[backgroundTheme]}`}>
          <canvas ref={canvasRef} className="block mx-auto max-w-full" />
        </div>
      )}
    </div>
  );
};

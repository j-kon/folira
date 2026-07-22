import React, { useEffect, useState, useRef } from 'react';
import type { ParsedEpubPackage, EpubTypographySettings } from '@/types/epub';
import { epubParserService } from '@/services/epubParserService';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import type JSZip from 'jszip';

export interface EpubReaderViewProps {
  zip: JSZip;
  packageData: ParsedEpubPackage;
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
  typography: EpubTypographySettings;
  backgroundTheme: string;
}

export const EpubReaderView: React.FC<EpubReaderViewProps> = ({
  zip,
  packageData,
  currentChapterIndex,
  onChapterChange,
  typography,
  backgroundTheme,
}) => {
  const [chapterHtml, setChapterHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const spineItems = packageData.spine;
  const currentSpineItem = spineItems[currentChapterIndex];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadChapter = async () => {
      if (!currentSpineItem) return;
      const manifestItem = packageData.manifest[currentSpineItem.idref];
      if (!manifestItem) return;

      try {
        const html = await epubParserService.getChapterHtml(zip, manifestItem.href, packageData.opfDir);
        if (isMounted) {
          setChapterHtml(html);
          setIsLoading(false);
          if (containerRef.current) {
            containerRef.current.scrollTop = 0;
          }
        }
      } catch (err) {
        console.error('Failed to load EPUB chapter:', err);
        if (isMounted) {
          setChapterHtml('<p className="p-4 text-red-500">Failed to render chapter content.</p>');
          setIsLoading(false);
        }
      }
    };

    loadChapter();
    return () => {
      isMounted = false;
    };
  }, [zip, packageData, currentChapterIndex, currentSpineItem]);

  const fontFamilyClass =
    typography.fontFamily === 'serif'
      ? 'font-editorial'
      : typography.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const themeTextClass =
    backgroundTheme === 'night' || backgroundTheme === 'dark'
      ? 'text-[#F8F5EE] bg-[#151A17]'
      : backgroundTheme === 'sepia'
      ? 'text-[#3E2723] bg-[#F2E4CB]'
      : 'text-[#252A27] bg-[#F8F5EE]';

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden relative ${themeTextClass}`}>
      {/* Scrollable Reflowable XHTML Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 scrollbar-thin"
        style={{
          paddingLeft: `${typography.marginPadding}px`,
          paddingRight: `${typography.marginPadding}px`,
        }}
      >
        <div className={`max-w-3xl mx-auto ${fontFamilyClass} leading-relaxed transition-all duration-150`}>
          {isLoading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#2F6B4F] dark:text-[#3D8B67]" />
              <span className="text-xs text-[#7A857F]">Loading chapter content...</span>
            </div>
          ) : (
            <div
              className="epub-content space-y-4"
              style={{
                fontSize: `${typography.fontSize}px`,
                lineHeight: typography.lineHeight,
              }}
              dangerouslySetInnerHTML={{ __html: chapterHtml }}
            />
          )}
        </div>
      </div>

      {/* Bottom Chapter Navigation Bar */}
      <div className="h-14 border-t border-[#E8E5DD] dark:border-[#2D3630] bg-[#FFFDF8]/90 dark:bg-[#1E2420]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0 select-none">
        <button
          onClick={() => onChapterChange(Math.max(0, currentChapterIndex - 1))}
          disabled={currentChapterIndex <= 0}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E5DD] dark:border-[#2D3630] disabled:opacity-30 hover:bg-[#E8E5DD]/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Chapter</span>
        </button>

        <span className="text-xs font-medium text-[#7A857F] dark:text-[#8E9992] flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Section {currentChapterIndex + 1} of {spineItems.length}
        </span>

        <button
          onClick={() => onChapterChange(Math.min(spineItems.length - 1, currentChapterIndex + 1))}
          disabled={currentChapterIndex >= spineItems.length - 1}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E5DD] dark:border-[#2D3630] disabled:opacity-30 hover:bg-[#E8E5DD]/50"
        >
          <span>Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

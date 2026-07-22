import React, { useState, useEffect } from 'react';
import { Highlighter, MessageSquarePlus, Check, X } from 'lucide-react';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { useReaderStore } from '@/stores/useReaderStore';
import type { AnnotationColor } from '@/types/document';

export const TextSelectionPopover: React.FC = () => {
  const { activeDocumentId, currentPage } = useReaderStore();
  const { addAnnotation } = useAnnotationStore();

  const [selectionText, setSelectionText] = useState<string>('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>('gold');
  const [noteText, setNoteText] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!showNoteInput) {
          setPosition(null);
          setSelectionText('');
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionText(text);
        setPosition({
          top: Math.max(10, rect.top - 54),
          left: Math.max(10, rect.left + rect.width / 2 - 120),
        });
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [showNoteInput]);

  if (!position || !selectionText || !activeDocumentId) return null;

  const handleSave = async (color: AnnotationColor) => {
    setSelectedColor(color);
    await addAnnotation({
      documentId: activeDocumentId,
      pageNumber: currentPage,
      selectedText: selectionText,
      color,
      note: noteText || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setPosition(null);
      setSelectionText('');
      setNoteText('');
      setShowNoteInput(false);
      window.getSelection()?.removeAllRanges();
    }, 600);
  };

  const colors: { name: AnnotationColor; bg: string }[] = [
    { name: 'gold', bg: 'bg-[#C89545]' },
    { name: 'forest', bg: 'bg-[#2F6B4F]' },
    { name: 'rose', bg: 'bg-[#C85555]' },
    { name: 'sky', bg: 'bg-[#3B82F6]' },
  ];

  return (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 flex flex-col bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150"
    >
      {savedSuccess ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F6B4F] dark:text-[#3D8B67] px-2 py-1">
          <Check className="w-4 h-4" />
          Saved Highlight!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#7A857F] dark:text-[#8E9992] flex items-center gap-1 pl-1">
              <Highlighter className="w-3.5 h-3.5" />
              Highlight:
            </span>

            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSave(c.name)}
                  className={`w-5 h-5 rounded-full ${c.bg} hover:scale-110 transition-transform focus:outline-none ring-1 ring-black/10`}
                  title={`Highlight with ${c.name}`}
                />
              ))}
            </div>

            <button
              onClick={() => setShowNoteInput((prev) => !prev)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
              title="Add Note"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPosition(null);
                setSelectionText('');
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNoteInput && (
            <div className="flex flex-col gap-1.5 pt-1 border-t border-[#E8E5DD] dark:border-[#2D3630]">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a personal reading note..."
                rows={2}
                className="w-56 p-2 bg-[#F8F5EE] dark:bg-[#151A17] text-xs text-[#252A27] dark:text-[#F8F5EE] border border-[#E8E5DD] dark:border-[#2D3630] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2F6B4F]"
              />
              <button
                onClick={() => handleSave(selectedColor)}
                className="py-1 px-2 bg-[#2F6B4F] text-white text-xs font-semibold rounded-md hover:bg-[#204B38] transition-colors"
              >
                Save Note & Highlight
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, BookOpen, Edit2, Star, Trash2 } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useUIStore } from '@/stores/useUIStore';

export interface DocumentMenuProps {
  document: DocumentRecord;
  onOpen: () => void;
}

export const DocumentMenu: React.FC<DocumentMenuProps> = ({ document, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { toggleFavourite } = useDocumentStore();
  const { openRenameModal, openDeleteConfirm } = useUIStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Options menu for ${document.name}`}
        aria-expanded={isOpen}
        className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emerald-accent)]"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-48 z-40 bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-xl shadow-lg py-1.5 text-sm animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpen();
            }}
            className="w-full px-3.5 py-2 flex items-center gap-2.5 text-left text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span>Open</span>
          </button>

          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              openRenameModal(document.id);
            }}
            className="w-full px-3.5 py-2 flex items-center gap-2.5 text-left text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
            <span>Rename</span>
          </button>

          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              toggleFavourite(document.id);
            }}
            className="w-full px-3.5 py-2 flex items-center gap-2.5 text-left text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-warm-subtle)] dark:hover:bg-[var(--color-dark-subtle)] transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                document.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-gray-500'
              }`}
            />
            <span>{document.isFavourite ? 'Unmark favourite' : 'Mark as favourite'}</span>
          </button>

          <div className="my-1 border-t border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)]" />

          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              openDeleteConfirm(document.id);
            }}
            className="w-full px-3.5 py-2 flex items-center gap-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove from library</span>
          </button>
        </div>
      )}
    </div>
  );
};

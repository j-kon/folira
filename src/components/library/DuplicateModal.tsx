import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Copy, BookOpen, XCircle } from 'lucide-react';
import type { DocumentRecord } from '@/types/document';

export interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDoc: DocumentRecord | null;
  onOpenExisting: () => void;
  onImportCopy: () => void;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  existingDoc,
  onOpenExisting,
  onImportCopy,
}) => {
  if (!existingDoc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Document Detected" maxWidth="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
          <Copy className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            An identical document named <strong className="font-semibold">"{existingDoc.name}"</strong> already exists in your local library.
          </div>
        </div>

        <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
          What would you like to do?
        </p>

        <div className="flex flex-col sm:flex-row justify-end gap-2.5 mt-2">
          <Button variant="outline" size="sm" onClick={onClose} leftIcon={<XCircle className="w-4 h-4" />}>
            Cancel Import
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onImportCopy}
          >
            Import Copy Anyway
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenExisting}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Open Existing Document
          </Button>
        </div>
      </div>
    </Modal>
  );
};

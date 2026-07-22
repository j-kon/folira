import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUIStore } from '@/stores/useUIStore';
import { useDocumentStore } from '@/stores/useDocumentStore';

export const RenameModal: React.FC = () => {
  const { renameModalDocId, closeRenameModal } = useUIStore();
  const { documents, renameDocument } = useDocumentStore();

  const doc = documents.find((d) => d.id === renameModalDocId);
  const [name, setName] = useState('');

  useEffect(() => {
    if (doc) {
      setName(doc.name);
    }
  }, [doc]);

  if (!doc) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      renameDocument(doc.id, name.trim());
      closeRenameModal();
    }
  };

  return (
    <Modal isOpen={!!renameModalDocId} onClose={closeRenameModal} title="Rename Document">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="rename-input" className="block text-xs font-medium text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] mb-1.5">
            Document title
          </label>
          <input
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[var(--color-warm-bg)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-xl text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald-accent)] transition-all"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button type="button" variant="tertiary" size="sm" onClick={closeRenameModal}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

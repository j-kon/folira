import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { getStorageEstimate, requestPersistentStorage, type StorageEstimateResult } from '@/utils/storageQuota';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { documentStorage } from '@/services/documentStorage';
import { formatFileSize } from '@/utils/formatters';
import { Database, ShieldCheck, Download, Upload, Trash2, HardDrive } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [estimate, setEstimate] = useState<StorageEstimateResult | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { documents, clearAllDocuments, loadDocuments } = useDocumentStore();
  const { showToast } = useNotificationStore();

  const fetchEstimate = async () => {
    const res = await getStorageEstimate();
    setEstimate(res);
  };

  useEffect(() => {
    fetchEstimate();
  }, [documents]);

  const handleRequestPersistence = async () => {
    const granted = await requestPersistentStorage();
    if (granted) {
      showToast('Persistent storage granted by browser!', 'success');
    } else {
      showToast('Browser denied or auto-manages storage persistence.', 'info');
    }
    fetchEstimate();
  };

  const handleExportMetadata = async () => {
    setIsExporting(true);
    try {
      const json = await documentStorage.exportMetadataJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folira-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported metadata backup JSON successfully.', 'success');
    } catch (err) {
      console.error('Export metadata error:', err);
      showToast('Failed to export metadata JSON.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportMetadata = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const text = await file.text();
      const res = await documentStorage.importMetadataJson(text);
      await loadDocuments();
      showToast(`Imported metadata for ${res.importedDocs} documents and ${res.importedBookmarks} bookmarks.`, 'success');
    } catch (err: any) {
      console.error('Import metadata error:', err);
      showToast(err?.message || 'Invalid backup JSON file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleClearAll = async () => {
    await clearAllDocuments();
    setIsConfirmingClear(false);
    fetchEstimate();
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
            Settings & Storage
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
            Manage your device storage, local database backups, and browser persistence permissions.
          </p>
        </div>

        {/* Section 1: Storage Overview */}
        <section className="p-6 rounded-3xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                Local Device Storage Usage
              </h2>
              <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored in browser IndexedDB.
              </p>
            </div>
          </div>

          {estimate && estimate.isAvailable ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-xs font-medium text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
                <span>Used: {formatFileSize(estimate.usage)}</span>
                <span>Quota: {formatFileSize(estimate.quota)} ({estimate.usagePercentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-emerald-accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, estimate.usagePercentage))}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Storage estimation is unavailable in this browser environment.
            </p>
          )}

          {/* Persistent Storage Request */}
          <div className="pt-4 border-t border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-emerald-accent)]" />
              <span className="text-xs font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                Persistent Storage Status:
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${estimate?.persistentGranted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                {estimate?.persistentGranted ? 'Granted' : 'Standard'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPersistence}
            >
              Request Persistence
            </Button>
          </div>
        </section>

        {/* Section 2: Metadata Backup & Restore */}
        <section className="p-6 rounded-3xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                Backup & Restore Metadata (JSON)
              </h2>
              <p className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
                Export reading progress, bookmarks, and document metadata to JSON. Note: Metadata backups exclude original PDF file binaries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <Button
              variant="secondary"
              size="sm"
              isLoading={isExporting}
              onClick={handleExportMetadata}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Metadata JSON
            </Button>

            <label className="inline-flex items-center">
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportMetadata}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  input?.click();
                }}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Import Metadata JSON
              </Button>
            </label>
          </div>
        </section>

        {/* Section 3: Data Reset */}
        <section className="p-6 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-red-900 dark:text-red-300">
              Clear Local Data
            </h2>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400 leading-relaxed">
              Remove all imported PDF documents, bookmarks, and saved reading progress from this browser device. This action cannot be undone.
            </p>
          </div>

          <div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsConfirmingClear(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete All Documents & Data
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        onConfirm={handleClearAll}
        title="Clear All Library Data?"
        description="Are you completely sure? This will delete all locally stored PDF documents, thumbnails, bookmarks, and reading history from your browser."
        confirmText="Yes, Clear Everything"
      />
    </MainLayout>
  );
};

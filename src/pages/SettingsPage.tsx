import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Badge } from '@/components/common/Badge';
import { getStorageEstimate, requestPersistentStorage, type StorageEstimateResult } from '@/utils/storageQuota';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useReaderStore } from '@/stores/useReaderStore';
import { useUIStore } from '@/stores/useUIStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { documentStorage } from '@/services/documentStorage';
import { formatFileSize } from '@/utils/formatters';
import {
  Palette,
  HardDrive,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Grid,
  List,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [estimate, setEstimate] = useState<StorageEstimateResult | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { documents, clearAllDocuments, loadDocuments, viewMode, setViewMode } = useDocumentStore();
  const { theme, toggleTheme } = useUIStore();
  const { backgroundTheme, setBackgroundTheme } = useReaderStore();
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
      showToast('Browser auto-manages storage persistence.', 'info');
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
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 flex flex-col gap-8 pb-16">
        <div>
          <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#252A27] dark:text-[#F8F5EE]">
            Settings & Storage
          </h1>
          <p className="mt-1.5 text-sm text-[#525B56] dark:text-[#C0C8C3]">
            Customize your reading preferences, view local device storage, and manage backups.
          </p>
        </div>

        {/* Section 1: Appearance Settings */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#DDEBE2] dark:bg-[#1C382B] text-[#2F6B4F] dark:text-[#3D8B67]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-semibold text-[#252A27] dark:text-[#F8F5EE]">
                Appearance & Reading Themes
              </h2>
              <p className="text-xs text-[#525B56] dark:text-[#C0C8C3]">
                Customize application interface theme, reader background color, and layout mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* App Interface Theme */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#252A27] dark:text-[#F8F5EE]">Application Theme</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'primary' : 'tertiary'}
                  size="sm"
                  leftIcon={<Sun className="w-4 h-4" />}
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                >
                  Light Mode
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'tertiary'}
                  size="sm"
                  leftIcon={<Moon className="w-4 h-4" />}
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                >
                  Dark Mode
                </Button>
              </div>
            </div>

            {/* Reader Theme Preference */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#252A27] dark:text-[#F8F5EE]">Default Reader Canvas Theme</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={backgroundTheme === 'paper' || backgroundTheme === 'light' ? 'primary' : 'tertiary'}
                  size="sm"
                  onClick={() => setBackgroundTheme('paper')}
                >
                  Paper
                </Button>
                <Button
                  variant={backgroundTheme === 'sepia' ? 'primary' : 'tertiary'}
                  size="sm"
                  onClick={() => setBackgroundTheme('sepia')}
                >
                  Sepia
                </Button>
                <Button
                  variant={backgroundTheme === 'night' || backgroundTheme === 'dark' ? 'primary' : 'tertiary'}
                  size="sm"
                  onClick={() => setBackgroundTheme('night')}
                >
                  Night
                </Button>
              </div>
            </div>

            {/* Library Layout Mode */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#252A27] dark:text-[#F8F5EE]">Default Library Layout</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
                  size="sm"
                  leftIcon={<Grid className="w-4 h-4" />}
                  onClick={() => setViewMode('grid')}
                >
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'tertiary'}
                  size="sm"
                  leftIcon={<List className="w-4 h-4" />}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Storage Overview & Backups */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#DDEBE2] dark:bg-[#1C382B] text-[#2F6B4F] dark:text-[#3D8B67]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-semibold text-[#252A27] dark:text-[#F8F5EE]">
                Local Device Storage & Backups
              </h2>
              <p className="text-xs text-[#525B56] dark:text-[#C0C8C3]">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored on your device.
              </p>
            </div>
          </div>

          {estimate && estimate.isAvailable ? (
            <ProgressBar
              value={estimate.usagePercentage}
              label={`Used: ${formatFileSize(estimate.usage)} of ${formatFileSize(estimate.quota)}`}
              showPercentage
              variant="forest"
            />
          ) : (
            <p className="text-xs text-[#ED6C02]">
              Storage quota estimation is managed automatically by your browser.
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DD] dark:border-[#2D3630]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />
              <span className="text-xs font-medium text-[#252A27] dark:text-[#F8F5EE]">
                Persistent Storage Status:
              </span>
              <Badge variant={estimate?.persistentGranted ? 'success' : 'default'}>
                {estimate?.persistentGranted ? 'Granted' : 'Standard'}
              </Badge>
            </div>

            <Button variant="tertiary" size="sm" onClick={handleRequestPersistence}>
              Request Persistence
            </Button>
          </div>

          {/* Backup & Restore Metadata */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E8E5DD] dark:border-[#2D3630]">
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
                variant="tertiary"
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

        {/* Section 3: Privacy & Security Statement */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#DDEBE2] dark:bg-[#1C382B] text-[#2F6B4F] dark:text-[#3D8B67]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-semibold text-[#252A27] dark:text-[#F8F5EE]">
                Privacy & Data Ownership
              </h2>
              <p className="text-xs text-[#525B56] dark:text-[#C0C8C3]">
                Folira is engineered as a 100% private personal reading application.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#525B56] dark:text-[#C0C8C3] leading-relaxed pt-2">
            <div className="p-3.5 bg-[#F8F5EE] dark:bg-[#151A17] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630]">
              <span className="font-semibold text-[#252A27] dark:text-[#F8F5EE] block mb-1">
                Zero Cloud Uploads
              </span>
              Your imported documents and reading notes never leave this device. Folira has no backend server or tracking.
            </div>

            <div className="p-3.5 bg-[#F8F5EE] dark:bg-[#151A17] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630]">
              <span className="font-semibold text-[#252A27] dark:text-[#F8F5EE] block mb-1">
                Browser Data Protection
              </span>
              Clearing browser site data or cookies can remove stored files. Export JSON backups to keep metadata safe.
            </div>
          </div>
        </section>

        {/* Section 4: About & Danger Zone */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img src="/favicon.svg" alt="Folira Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-editorial text-lg font-bold text-[#252A27] dark:text-[#F8F5EE]">
                  Folira v0.2.0
                </h2>
                <p className="text-xs text-[#7A857F] dark:text-[#8E9992]">
                  Read anything. Even offline.
                </p>
              </div>
            </div>
            <Badge variant="forest">PWA Standalone</Badge>
          </div>

          <div className="pt-4 border-t border-[#E8E5DD] dark:border-[#2D3630] flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-[#D32F2F]">Clear Local Library Data</h3>
            <p className="text-xs text-[#525B56] dark:text-[#C0C8C3]">
              Remove all imported PDF documents, bookmarks, and saved reading progress from this browser device.
            </p>
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsConfirmingClear(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete All Documents & Data
              </Button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        onConfirm={handleClearAll}
        title="Remove All Library Data?"
        description="Are you sure you want to delete all locally stored PDF documents, thumbnails, bookmarks, and reading history from your browser? This action cannot be undone."
        confirmText="Yes, Remove Everything"
      />
    </MainLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getStorageEstimate, type StorageEstimateResult } from '@/utils/storageQuota';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { db } from '@/services/database';
import { formatFileSize } from '@/utils/formatters';
import { Activity, Wifi, WifiOff, Cpu, Database, Smartphone, ShieldCheck } from 'lucide-react';

export const DiagnosticPage: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { documents } = useDocumentStore();
  const [estimate, setEstimate] = useState<StorageEstimateResult | null>(null);
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [displayMode, setDisplayMode] = useState<string>('browser');

  useEffect(() => {
    getStorageEstimate().then(setEstimate);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setSwStatus(`Active (${reg.active ? 'running' : 'installing/waiting'})`);
        } else {
          setSwStatus('Not registered');
        }
      }).catch(() => setSwStatus('Error checking SW'));
    } else {
      setSwStatus('Service Worker API unsupported');
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDisplayMode('standalone (PWA)');
    } else {
      setDisplayMode('browser tab');
    }
  }, [documents]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 flex flex-col gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Development Diagnostic Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
            Folira Diagnostics & System State
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Network State */}
          <div className="p-5 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                Network Connection Status
              </span>
              <span className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>
          </div>

          {/* Service Worker State */}
          <div className="p-5 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                Service Worker Status
              </span>
              <span className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                {swStatus}
              </span>
            </div>
          </div>

          {/* Database State */}
          <div className="p-5 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                Dexie IndexedDB Database
              </span>
              <span className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                Name: {db.name} (Version {db.verno})
              </span>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mt-0.5">
                Stored documents: {documents.length}
              </span>
            </div>
          </div>

          {/* Storage Quota State */}
          <div className="p-5 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                Browser Storage Quota & Persistence
              </span>
              <span className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                {estimate ? `${formatFileSize(estimate.usage)} / ${formatFileSize(estimate.quota)} (${estimate.usagePercentage}%)` : 'Unavailable'}
              </span>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block mt-0.5">
                Persistence granted: {estimate?.persistentGranted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* PWA Display Mode */}
          <div className="p-5 rounded-2xl bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[var(--color-emerald-accent)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] block">
                PWA Display Mode & Version
              </span>
              <span className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                {displayMode} (Folira v1.0.0)
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

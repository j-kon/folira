import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

export const PWAUpdateBanner: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        const updateFn = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            console.log('Folira app shell is ready for offline reading.');
          },
        });
        setUpdateSW(() => updateFn);
      }).catch((err) => {
        console.warn('PWA registration module load error:', err);
      });
    }
  }, []);

  if (!needRefresh) return null;

  const handleUpdate = () => {
    if (updateSW) {
      updateSW();
    }
    window.location.reload();
  };

  return (
    <div className="fixed top-20 right-5 z-50 max-w-md w-full p-4 rounded-2xl bg-[var(--color-emerald-accent)] text-white shadow-xl border border-white/20 flex items-center justify-between gap-3 animate-in slide-in-from-top-5">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin shrink-0" />
        <div>
          <h4 className="text-sm font-bold">New Version Available</h4>
          <p className="text-xs text-emerald-100">
            A new version of Folira is ready. Update now to refresh your app shell.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUpdate}
          className="bg-white text-[var(--color-emerald-accent)] hover:bg-emerald-50"
        >
          Update Now
        </Button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1 text-white/80 hover:text-white"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

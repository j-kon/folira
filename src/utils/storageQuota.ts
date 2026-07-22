export interface StorageEstimateResult {
  usage: number; // bytes
  quota: number; // bytes
  usagePercentage: number;
  isAvailable: boolean;
  persistentGranted: boolean;
}

export async function getStorageEstimate(): Promise<StorageEstimateResult> {
  let usage = 0;
  let quota = 0;
  let isAvailable = false;
  let persistentGranted = false;

  if (typeof navigator !== 'undefined' && navigator.storage) {
    if (navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usage = estimate.usage || 0;
        quota = estimate.quota || 0;
        isAvailable = true;
      } catch (err) {
        console.warn('Storage estimate failed:', err);
      }
    }

    if (navigator.storage.persisted) {
      try {
        persistentGranted = await navigator.storage.persisted();
      } catch (err) {
        console.warn('Check persistent storage failed:', err);
      }
    }
  }

  const usagePercentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;

  return {
    usage,
    quota,
    usagePercentage,
    isAvailable,
    persistentGranted,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (err) {
      console.warn('Request persistent storage error:', err);
      return false;
    }
  }
  return false;
}

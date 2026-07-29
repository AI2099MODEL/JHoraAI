import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe Storage Patch to prevent QuotaExceededError crashes and gracefully recover
if (typeof window !== "undefined" && window.Storage) {
  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  // Use WeakMap to support partition backup storage per Storage instance (localStorage vs sessionStorage)
  const storageBackups = new WeakMap<Storage, Map<string, string>>();

  const getBackupMap = (storage: Storage): Map<string, string> => {
    let backup = storageBackups.get(storage);
    if (!backup) {
      backup = new Map<string, string>();
      storageBackups.set(storage, backup);
    }
    return backup;
  };

  Storage.prototype.setItem = function (key: string, value: string) {
    const backup = getBackupMap(this);
    backup.set(key, value);

    try {
      originalSetItem.call(this, key, value);
    } catch (e: any) {
      console.warn(`[Storage Utility] Quota exceeded or error setting key "${key}":`, e);
      
      if (e.name === "QuotaExceededError" || e.code === 22 || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        try {
          console.info("[Storage Utility] Attempting to free up storage space by clearing cached astrology data...");
          originalRemoveItem.call(this, "jhora_astrology_data");
          
          // Try saving again
          originalSetItem.call(this, key, value);
          console.info(`[Storage Utility] Successfully recovered and saved key "${key}" after cleanup.`);
        } catch (retryErr) {
          console.warn(`[Storage Utility] Persistent quota limit reached. Falling back to persistent in-memory storage for key "${key}".`);
        }
      }
    }
  };

  Storage.prototype.getItem = function (key: string): string | null {
    const val = originalGetItem.call(this, key);
    if (val !== null) {
      return val;
    }
    const backup = getBackupMap(this);
    return backup.has(key) ? backup.get(key) || null : null;
  };

  Storage.prototype.removeItem = function (key: string) {
    const backup = getBackupMap(this);
    backup.delete(key);
    originalRemoveItem.call(this, key);
  };

  Storage.prototype.clear = function () {
    const backup = getBackupMap(this);
    backup.clear();
    originalClear.call(this);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

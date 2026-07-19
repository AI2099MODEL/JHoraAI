import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe Storage Patch to prevent QuotaExceededError crashes and gracefully recover
if (typeof window !== "undefined" && window.Storage) {
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    try {
      originalSetItem.call(this, key, value);
    } catch (e: any) {
      console.warn(`[Storage Utility] Quota exceeded or error setting key "${key}":`, e);
      
      if (e.name === "QuotaExceededError" || e.code === 22 || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        try {
          console.info("[Storage Utility] Attempting to free up storage space by clearing cached astrology data...");
          localStorage.removeItem("jhora_astrology_data");
          
          // Try saving again
          originalSetItem.call(this, key, value);
          console.info(`[Storage Utility] Successfully recovered and saved key "${key}" after cleanup.`);
        } catch (retryErr) {
          console.error(`[Storage Utility] Failed to save key "${key}" even after clearing cache:`, retryErr);
        }
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

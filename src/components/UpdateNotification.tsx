/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";

export default function UpdateNotification() {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          setRegistration(reg);

          // Detect updates already waiting
          if (reg.waiting) {
            setShowBanner(true);
          }

          // Detect future updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; please refresh.
                    setShowBanner(true);
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });

      // Handle controllerchange (active worker swapped, reload page)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Periodically fetch update.json (every 10 minutes) to check for newer version code
    const checkInterval = setInterval(checkForUpdateManifest, 10 * 60 * 1000);
    // Initial check after load
    setTimeout(checkForUpdateManifest, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  const checkForUpdateManifest = async () => {
    try {
      const response = await fetch("/update.json?t=" + Date.now());
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const manifest = await response.json();
          // Check local storage for cached manifest version code or compare current version 1.0.0
          const currentVersion = "1.0.0";
          if (manifest.version !== currentVersion) {
            console.log("Website Auto Update: New version manifest detected!", manifest.version);
            if (registration) {
              registration.update();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not check update manifest:", e);
    }
  };

  const handleRefresh = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ action: "skipWaiting" });
    } else {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 border border-amber-500/40 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-bounce"
      id="sw-update-notification-banner"
    >
      <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 shrink-0">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-sans font-medium text-amber-400">
            New Version Available
          </h4>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          A newer update has been successfully deployed. Refresh now to load version 1.0.1 safely.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            Refresh Now
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cache name containing versioning for safe caching
const CACHE_NAME = "jhoraai-cache-v1.0.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/update.json"
];

// Install Event - caches critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Force immediate takeover
      return self.skipWaiting();
    })
  );
});

// Activate Event - clean up legacy caches to prevent corruptions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Legacy Cache", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network-First falling back to Cache strategy for real-time APIs
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass cache for standard local Node backend APIs or external astrological servers
  if (url.pathname.startsWith("/api/") || url.hostname.includes("run.app") || url.hostname.includes("googleapis.com")) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // If successful, cache and return
        if (networkResponse && networkResponse.status === 200 && req.method === "GET") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Return index.html for SPA router paths if cache matches nothing
          if (req.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline content not cached.", { status: 503, statusText: "Offline" });
        });
      })
  );
});

// Listen for update message commands to trigger skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

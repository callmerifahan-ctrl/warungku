const CACHE_NAME = "warungku-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./cashier.html",
  "./history.html",
  "./transaction-detail.html",
  "./receipt.html",
  "./report.html",
  "./style.css",
  "./script.js",
  "./cashier.js",
  "./history.js",
  "./transaction-detail.js",
  "./receipt.js",
  "./report.js",
  "./manifest.json",
  "./images/logo.png"
];

// Install Service Worker & Cache Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate & Clear Old Cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Assets (Lewati pencarian cache jika request menuju Supabase)
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
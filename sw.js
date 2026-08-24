const CACHE_NAME = "warungku-v1";
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
  "./manifest.json"
];

// Install Service Worker & Cache Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Assets from Cache / Network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
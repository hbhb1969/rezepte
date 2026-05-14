const CACHE_NAME = 'rezepte-v1';
const ASSETS = [
  '/rezepte/rezepte.html',
  '/rezepte/manifest.json',
  '/rezepte/icon-192.png',
  '/rezepte/icon-512.png'
];

// Install: alle Assets cachen
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: alte Caches löschen
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-first
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        // Neue Ressourcen auch cachen
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      });
    }).catch(function() {
      // Offline-Fallback
      return caches.match('/rezepte/rezepte.html');
    })
  );
});

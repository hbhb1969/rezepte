const CACHE_NAME = 'rezepte-v2';

// Install: sofort aktivieren, kein Pre-Caching das scheitern könnte
self.addEventListener('install', function(e) {
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
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: Network-first, bei Fehler Cache
self.addEventListener('fetch', function(e) {
  // Nur GET-Requests behandeln
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Erfolgreiche Antwort im Cache speichern
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Offline: aus Cache liefern
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/rezepte/rezepte.html');
      });
    })
  );
});

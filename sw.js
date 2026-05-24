// FORGE Fitness PWA Service Worker
// Offline-first cache strategy with comprehensive asset caching

const CACHE_NAME = 'forge-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@400;600;700;900&display=swap'
];

// ============================================================================
// INSTALL EVENT - Cache essential assets
// ============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache core files individually to avoid failing on missing files
      return Promise.all(
        urlsToCache.map(url => 
          cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ============================================================================
// FETCH EVENT - Cache-first strategy
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignore favicon and other non-critical requests
  if (request.url.includes('favicon') || request.url.includes('.ico')) {
    return;
  }

  // Network requests
  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached response if available
      if (response) {
        return response;
      }

      // Otherwise, try to fetch from network
      return fetch(request).then((response) => {
        // Don't cache non-200 responses or opaque responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch((err) => {
        // Network request failed, try to return offline fallback
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return null;
      });
    })
  );
});

// ============================================================================
// PERIODIC BACKGROUND SYNC (optional, for future enhancements)
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forge-data') {
    event.waitUntil(
      // Future: sync steps, plan data, etc. with a backend
      Promise.resolve()
    );
  }
});

// ============================================================================
// MESSAGE HANDLER (optional, for future enhancements)
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// NOTIFICATION CLICK HANDLER
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

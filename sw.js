// FORGE Fitness PWA Service Worker
// Cache-first strategy with offline fallback

const CACHE_NAME = 'forge-v1';
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
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('Some assets could not be cached during install:', err);
        // Cache what we can, don't fail on missing files
        return cache.addAll(urlsToCache.filter(url => !url.includes('icon')));
      });
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
      }).catch(() => {
        // Network request failed, try to return offline fallback
        return caches.match('/index.html');
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

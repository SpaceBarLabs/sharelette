// sw.js

const CACHE_NAME = 'sharelette-v2'; // Incremented version to ensure old caches are cleared
const urlsToCache = [
  '/',
  '/index.html',
  '/qrcode.min.js',
  '/sharelette.jpeg',
  '/SBL_Logo.svg'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Define caching strategies based on the request type
self.addEventListener('fetch', event => {
  // Use a "Network First, falling back to cache" strategy for navigation requests (the HTML page)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the network request is successful, clone the response, cache it, and return it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If the network request fails (user is offline), try to serve the page from the cache
          console.log('Network request failed. Serving navigation request from cache.');
          return caches.match(event.request);
        })
    );
    return; // End execution for navigation requests
  }

  // Use a "Cache First, falling back to network" strategy for all other requests (CSS, JS, images)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached response if found, otherwise fetch from the network
        return response || fetch(event.request);
      })
  );
});

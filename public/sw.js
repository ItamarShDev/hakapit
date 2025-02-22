const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    // Add other static assets you want to cache
];

const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';
const MAX_CACHE_ITEMS = 50; // Limit number of items in dynamic cache

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Determine the request type
    const requestUrl = new URL(event.request.url);

    // Strategy for different types of requests
    if (requestUrl.origin === location.origin) {
        // For same-origin requests
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    // Return cached response if available
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // For dynamic content, try network first
                    return fetch(event.request)
                        .then((networkResponse) => {
                            // Only cache successful responses
                            if (networkResponse && networkResponse.status === 200) {
                                return caches.open(DYNAMIC_CACHE_NAME)
                                    .then((cache) => {
                                        // Limit cache size
                                        cache.keys().then((keys) => {
                                            if (keys.length >= MAX_CACHE_ITEMS) {
                                                cache.delete(keys[0]);
                                            }
                                        });

                                        // Cache the response
                                        cache.put(event.request, networkResponse.clone());
                                        return networkResponse;
                                    });
                            }
                            return networkResponse;
                        });
                })
        );
    } else {
        // For cross-origin requests, use network first strategy
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

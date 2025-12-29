/**
 * Service Worker for PWA
 * Caches core assets for offline usage
 * Version: v3 (Cache Busting)
 */

const CACHE_NAME = 'super-calc-v3-cache';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/variables.css',
    './css/main.css',
    './js/app.js',
    './js/modules/tabs.js',
    './js/modules/calculator.js',
    './js/modules/currency.js',
    './js/modules/interest.js',
    './js/modules/financing.js',
    './js/modules/fire.js',
    './js/modules/salary.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js' // Cache external dependency
];

// Install: Cache files and force skipWaiting
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force this SW to become active immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching Core Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take control of all pages immediately
        })
    );
});

// Fetch: Network First for HTML, Cache First for assets, or Stale-While-Revalidate
// Simple implementation: Cache First, falling back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
                // Determine if we should cache new requests dynamically
                // For now, strict static caching is safer for version control
                return response;
            });
        })
    );
});

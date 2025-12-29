/**
 * Service Worker for PWA
 * Caches core assets for offline usage
 */

const CACHE_NAME = 'super-calc-v2-cache';
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
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching Core Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

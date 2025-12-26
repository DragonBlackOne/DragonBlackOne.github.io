const CACHE_NAME = 'super-calc-v1';
const ASSETS = [
    './',
    './index.html',
    './src/css/style.css',
    './src/js/main.js',
    './src/js/modules/tabs.js',
    './src/js/modules/calculator.js',
    './src/js/modules/currency.js',
    './src/js/modules/interest.js',
    './src/js/modules/utils.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

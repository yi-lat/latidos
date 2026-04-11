const CACHE_NAME = 'latidos-v1';
const urlsToCache = [
    '/latidos/',
    '/latidos/index.html',
    '/latidos/style.css',
    '/latidos/app.js',
    '/latidos/manifest.json',
    '/latidos/icon-192.png',
    '/latidos/icon-512.png',
    '/latidos/logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
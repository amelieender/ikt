self.addEventListener('install', event => event.waitUntil(
    caches.open('sw-cache-v1')
        .then(cache => cache.add('/'))
));

self.addEventListener('fetch', event => event.respondWith(
    caches.open('sw-chache-v1')
        .then(cache => cache.match(event.request))
        .then(response => response || fetch(event.request))
));

// self.addEventListener('activate', event => {
//     console.log('service worker --> activating ...', event);
//     return self.clients.claim();
// })

// self.addEventListener('fetch', event => event.respondWith(
//     caches.open('sw-cache-v1')
//     .then(cache => cache.match(event.request))
//     .then(response => response)
// ));

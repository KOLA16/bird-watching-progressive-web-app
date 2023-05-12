const CACHE_NAME = `bird-watching-v1`

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll([
            '/',
            '/add',
            '/javascripts/add.js',
            '/javascripts/sighting.js',
            '/javascripts/sightings.js',
            '/stylesheets/style.css',
            '/uploads/image-not-available.jpg'
        ])
    })())
})

self.addEventListener('fetch', event => {
    event.respondWith((async () => {

        try {
            // Try network first.
            const fetchResponse = await fetch(event.request)
            return fetchResponse
        } catch (e) {
            // The network failed, so try cache
            const cache = await caches.open(CACHE_NAME)
            const cachedResponse = await cache.match(event.request)
            if (cachedResponse) return cachedResponse
        }

    })())
})
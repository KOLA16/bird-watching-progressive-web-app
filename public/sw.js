const CACHE_NAME = `bird-watching-v1`

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME)
        cache.addAll([
            '/',
            '/add',
            '/no_connection.html',
            '/javascripts/add.js',
            '/javascripts/sighting.js',
            '/javascripts/sightings.js',
            '/stylesheets/style.css',
            '/uploads/image-not-available.jpg'
        ])
    })())
})

self.addEventListener('activate', event => {
    // Can be used to clean up outdated caches
})

self.addEventListener('fetch', event => {
    event.respondWith((async () => {

        try {
            // Try network first.
            const fetchResponse = await fetch(event.request)

            // Save the resource in the cache.
            // cache.put(event.request, fetchResponse.clone())

            return fetchResponse
        } catch (e) {
            // The network failed, so try cache
            const cache = await caches.open(CACHE_NAME)
            const cachedResponse = await cache.match(event.request)
            if (cachedResponse) {
                return cachedResponse
            } else {
                return cache.match('/no_connection.html')
            }
        }
    })())
})
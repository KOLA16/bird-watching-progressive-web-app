const CACHE_NAME = `bird-watching-v1`

let requestIDB;

const handleAddSighting = async (requestClone) => {

    requestClone.formData().then(formData => {

        let formValues = []
        for (const pair of formData.entries()) {
            formValues.push(pair[1])
        }

        const localIDB = requestIDB.result
        const transaction = localIDB.transaction(["sightings"], "readwrite")
        const localStore = transaction.objectStore("sightings")

        // TODO: Handle offline uploading of images

        const putRequest = localStore.add({
            author: formValues[0],
            observation_date: formValues[1],
            lat: formValues[2],
            lng: formValues[3],
            identification: formValues[4],
            description: formValues[5],
            image: null,
            chat_history: []
        })

        putRequest.addEventListener("success", () => {
            console.log('Sighting successfully added to the IndexedDB')
        })

    })
}

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

    const handleSuccess = () => {
        console.log('Database opened')
    }

    const handleUpgrade = (ev) => {
        const db = ev.target.result
        db.createObjectStore("usernames", { keyPath: "id" })
        db.createObjectStore("sightings", { keyPath: "id", autoIncrement: true})
        console.log('Upgraded object store')
    }

    // Open indexedDB
    requestIDB = indexedDB.open("local")
    requestIDB.addEventListener("upgradeneeded", handleUpgrade)
    requestIDB.addEventListener("success", handleSuccess)
    requestIDB.addEventListener("error", (err) => {
        console.log("ERROR : " + JSON.stringify(err))
    })
})

self.addEventListener('fetch', event => {
    const requestClone = event.request.clone()
    const requestUrl = event.request.url
    const requestMethod = event.request.method

    const addUrl = "/add"

    event.respondWith((async () => {

        try {
            // Try network first.
            const fetchResponse = await fetch(event.request)

            // TODO: Update cache with network responses

            return fetchResponse
        } catch (e) {
            // The network failed, so try cache
            const cache = await caches.open(CACHE_NAME)
            const cachedResponse = await cache.match(event.request)
            // If resources found in cache return from cache
            if (cachedResponse) {
                return cachedResponse
            // If post request from /add page store sighting in IndexedDB
            } else if (requestUrl.indexOf(addUrl) > -1 && requestMethod === "POST") {
                handleAddSighting(requestClone)
                return cache.match('/')
            // Return 'sorry, no connection :(' if resource can not be accessed offline
            } else {
                return cache.match('/no_connection.html')
            }
        }
    })())
})
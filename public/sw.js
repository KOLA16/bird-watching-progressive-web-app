const CACHE_NAME = `bird-watching-v1`

let requestIDB

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME)
            const addAll = await cache.addAll([
                '/',
                '/add',
                '/no_connection.html',
                '/javascripts/add.js',
                '/javascripts/sighting.js',
                '/javascripts/sightings.js',
                '/stylesheets/style.css',
                '/uploads/image-not-available.jpg'
            ])
        } catch (err) {
            console.log('Error when pre-caching static resources: ' + err)
        }
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
        } catch (err) {
            // The network failed, so try cache
            const cache = await caches.open(CACHE_NAME)
            const cachedResponse = await cache.match(event.request)

            // If matching request found in cache, cachedResponse resolves
            // to Response and can be returned, otherwise it resolves to
            // 'undefined'
            if (cachedResponse) {
                return cachedResponse
            } else if (requestUrl.indexOf(addUrl) > -1 && requestMethod === "POST") {

                // TODO: When reloading the page after online addition of sighting
                // with each reload new copy of the sighting is added to indexedDB
                // When back to online, the post is send to server and updates MongoDB
                // with the last offline added sighting

                // If post request from /add page store sighting in IndexedDB
                // and stay on the add page
                await addSighting(requestClone)
                // Request background sync of sightings
                await requestBackgroundSync('sync-sightings')

                return cache.match('/add')

            } else {
                // Return 'sorry, no connection :(' page if resource can not be accessed offline
                return cache.match('/no_connection.html')
            }
        }
    })())
})

self.addEventListener('sync', event => {
    console.log('Sync event triggered: ' + event.tag)

    if (event.tag === 'sync-sightings') {
        event.waitUntil(updateServer())
    } else if (event.tag === 'sync-chats') {
        console.log('Sync chat messages.')
    }
})



const addSighting = async (requestClone) => {

    try {
        const formData = await requestClone.formData()

        // Iterate over key-value pairs of the formData
        let formValues = []
        for (const pair of formData.entries()) {
            formValues.push(pair[1])
        }

        const localIDB = requestIDB.result
        const transaction = localIDB.transaction(["sightings"], "readwrite")
        const localStore = transaction.objectStore("sightings")

        const putRequest = localStore.add({
            author: formValues[0],
            obs_date: formValues[1],
            lat: formValues[2],
            lng: formValues[3],
            bird_species: formValues[4],
            desc: formValues[5],
            img: formValues[6],
            chat_history: []
        })

        putRequest.addEventListener("success", () => {
            console.log('Sighting successfully added to the IndexedDB')
        })
    } catch (err) {
        console.log("Error when adding new sighting to IndexedDB: " + err)
    }
}

const updateServer = () => {
    console.log('updateServer called')

    const localIDB = requestIDB.result
    const transaction = localIDB.transaction(["sightings"], "readwrite")
    const localStore = transaction.objectStore("sightings")

    const getAllRequest = localStore.getAll()

    getAllRequest.addEventListener("success", () => {
        const sightings = getAllRequest.result

        for (const sighting of sightings) {

            // Append sighting details stored in
            // indexedDB to a form
            const formData = new FormData()
            for (const key in sighting) {
                formData.append(key, sighting[key])
            }

            // Post sighting to server
            fetch('/add', {
                method: 'post',
                body: formData
            }).then((fetchResponse) => {
                if (fetchResponse.ok) {
                    // Delete sightings from indexedDB if post successful
                    // Need to open new transaction because the previous one terminates
                    const transaction = localIDB.transaction(["sightings"], "readwrite")
                    const localStore = transaction.objectStore("sightings")
                    const deleteRequest = localStore.delete(sighting.id)
                    deleteRequest.addEventListener('success', () => {
                        console.log('Sighting deleted from indexedDB', sighting)
                    })
                }
            }).catch(err => console.log('Failed to synchronise sightings data', err))
        }
    })
}

/**
 * Registers sync event with a provided tag.
 * @param tag string representing tag name
 * @returns {Promise<void>}
 */
const requestBackgroundSync = async (tag) => {
    await self.registration.sync.register(tag)
}
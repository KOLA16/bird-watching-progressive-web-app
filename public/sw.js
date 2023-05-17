const CACHE_NAME = `bird-watching-v1`
const DB_NAME = 'local'
const USER_STORE_NAME = 'usernames'
const SIGHTINGS_STORE_NAME = 'sightings'

let requestIDB

// self.importScripts('./javascripts/indexeddb.js')

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
                '/javascripts/indexeddb.js',
                '/stylesheets/style.css',
                '/uploads/image-not-available.jpg'
            ])
        } catch (err) {
            console.log('Error when pre-caching static resources: ' + err)
        }
    })())
})

self.addEventListener('activate', event => {

    //initIndexedDB(() => {console.log('SW: Database Opened')})

    // Open indexedDB
    initIndexedDB()
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

                return cache.match('/')

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

/**
 * Registers sync event with a provided tag.
 * @param tag string representing tag name
 * @returns {Promise<void>}
 */
const requestBackgroundSync = async (tag) => {
    await self.registration.sync.register(tag)
}

/////// **** Service Worker IndexedDB operations **** ///////

/**
 * Takes the add new sighting request when offline and stores it in
 * IndexedDB
 * @param requestClone
 * @returns {Promise<void>}
 */
const addSighting = async (requestClone) => {

    try {
        const formData = await requestClone.formData()

        // Iterate over key-value pairs of the formData
        let formValues = []
        for (const pair of formData.entries()) {
            formValues.push(pair[1])
        }

        const localIDB = requestIDB.result
        const transaction = localIDB.transaction([SIGHTINGS_STORE_NAME], "readwrite")
        const localStore = transaction.objectStore(SIGHTINGS_STORE_NAME)

        const addRequest = localStore.add({
            author: formValues[0],
            obs_date: formValues[1],
            lat: formValues[2],
            lng: formValues[3],
            bird_species: formValues[4],
            desc: formValues[5],
            img: formValues[6],
            chat_history: [],
        })

        addRequest.addEventListener("success", () => {
            console.log('Sighting successfully added to the IndexedDB')
        })
    } catch (err) {
        console.log("Error when adding new sighting to IndexedDB: " + err)
    }
}

/**
 * Retrieve sightings stored locally in the IndexedDB and
 * send them to the server MongoDB database. If server updated successfully,
 * it also deletes the sightings stored in IndexedDB.
 */
const updateServer = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([SIGHTINGS_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(SIGHTINGS_STORE_NAME)

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
                    const transaction = localIDB.transaction([SIGHTINGS_STORE_NAME], "readwrite")
                    const localStore = transaction.objectStore(SIGHTINGS_STORE_NAME)
                    const deleteRequest = localStore.delete(sighting.id)
                    deleteRequest.addEventListener('success', () => {
                        console.log('Sighting deleted from indexedDB', sighting)
                    })
                }
            }).catch(err => console.log('Failed to synchronise sightings data', err))
        }
    })
}


const handleUpgrade = (ev) => {
    const db = ev.target.result
    db.createObjectStore(USER_STORE_NAME, { keyPath: "id" })
    db.createObjectStore(SIGHTINGS_STORE_NAME, { keyPath: "id", autoIncrement: true})
    console.log('Upgraded object store')
}

const initIndexedDB = () => {
    requestIDB = indexedDB.open(DB_NAME)
    requestIDB.addEventListener("upgradeneeded", handleUpgrade)
    requestIDB.addEventListener("success", () => {
        console.log("Database opened (SW).")
    })
    requestIDB.addEventListener("error", (err) => {
        console.log("ERROR : " + JSON.stringify(err))
    })
}
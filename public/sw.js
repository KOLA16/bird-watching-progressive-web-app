const CACHE_NAME = `bird-watching-v1`
const PRE_CACHED_RESOURCES = [ '/',
    '/add',
    '/no_connection.html',
    '/javascripts/add.js',
    '/javascripts/sighting.js',
    '/javascripts/sightings.js',
    '/javascripts/indexeddb.js',
    '/stylesheets/style.css',
    '/uploads/image-not-available.jpg',
]

const DB_NAME = 'local'
const USER_STORE_NAME = 'usernames'
const SIGHTINGS_STORE_NAME = 'sightings'
let requestIDB

/**
 * Uses 'install' event to pre-cache all the required static resources
 */
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME)
            const addAll = await cache.addAll(PRE_CACHED_RESOURCES)
        } catch (err) {
            console.log('Error when pre-caching static resources: ' + err)
        }
    })())
})

/**
 * Opens indexedDB database on the 'activate' event, and it also
 * clears old caches
 */
self.addEventListener('activate', event => {
    // Open indexedDB
    initIndexedDB()

    // Clear old caches
    event.waitUntil((async () => {
        try {
            const names = await caches.keys()
            await Promise.all(names.map(name => {
                if (name !== CACHE_NAME) {
                    // If a cache's name is the current name, delete it.
                    return caches.delete(name)
                }
            }))
        } catch (err) {
            console.log('Failed to clear old caches: ' + err)
        }
    })())
})

/**
 * Implements simple network-first caching strategy.
 */
self.addEventListener('fetch', event => {
    const requestClone = event.request.clone()
    const requestUrl = event.request.url
    const requestMethod = event.request.method
    const requestMode = event.request.mode


    const addUrl = "/add"

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME)

        try {

            // Try network first.
            const fetchResponse = await fetch(event.request)

            // Update cache with network responses, but only if
            // response code in the range 200-299 to avoid caching
            // of 'opaque' resources such as Google Maps,
            // and avoid caching of any Cross-Origin Resources
            if (fetchResponse.ok && requestMode !== 'cors') {
                cache.put(event.request, fetchResponse.clone())
            }

            return fetchResponse
        } catch (err) {
            // The network failed, so try cache
            const cachedResponse = await cache.match(event.request)

            // If matching request found in cache, cachedResponse resolves
            // to Response and can be returned, otherwise it resolves to
            // 'undefined'
            if (cachedResponse) {
                return cachedResponse
            } else if (requestUrl.indexOf(addUrl) > -1 && requestMethod === "POST") {
                // If post request from /add page store sighting in IndexedDB
                // and display main page
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

/**
 * Listens to the 'sync' event, and updates server database
 * with the new resources added by user when he was offline
 */
self.addEventListener('sync', event => {
    console.log('Sync event triggered: ' + event.tag)

    // Add sightings stored locally to the server
    if (event.tag === 'sync-sightings') {
        event.waitUntil(updateServer())
    } else if (event.tag === 'sync-chats') {
        // TODO: syncing chat messages added offline
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

/////// **** Database interactions **** ///////

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
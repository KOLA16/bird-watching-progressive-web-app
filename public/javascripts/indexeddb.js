const DB_NAME = 'local'
const USER_STORE_NAME = 'usernames'
const SIGHTINGS_STORE_NAME = 'sightings'

// Stores database open request object
let requestIDB

/**
 * Generates initial random username ('Username${randomNumber}), and
 * stores it in database
 */
const addRandomUsername = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([USER_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(USER_STORE_NAME)

    // Generate random username
    const randId = Math.floor(Math.random() * 1000000)
    const username = `Username${randId}`

    const addRequest = localStore.add({id: 1, username: username})
    addRequest.addEventListener("success", () => {
        console.log('Random username generated')
    })
}
window.addRandomUsername = addRandomUsername

/**
 * Changes the initial username to a new username provided by the user
 * @param username
 */
const changeUsername = (username) => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([USER_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(USER_STORE_NAME)

    const putRequest = localStore.put({id: 1, username: username})
    putRequest.addEventListener("success", () => {
        console.log('Username changed to ' + username)
    })
}
window.changeUsername = changeUsername

/**
 * Gets username from the database
 * @param readSuccessCallback called when reading username successful
 */
const getUsername = (readSuccessCallback) => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([USER_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(USER_STORE_NAME)

    const getRequest = localStore.get(1)
    getRequest.addEventListener("success", () => {
        const username = getRequest.result.username
        readSuccessCallback(username)
    })
}
window.getUsername = getUsername

/**
 * Add a new sighting to the database using form input values
 * @param formInputs
 * @param writeSuccessCallback
 */
const addSighting = (formInputs) => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([SIGHTINGS_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(SIGHTINGS_STORE_NAME)

    const addRequest = localStore.add( {
        author: formInputs.author,
        obs_date: formInputs.obs_date,
        lat: formInputs.lat,
        lng: formInputs.lng,
        identification: formInputs.bird_species,
        desc: formInputs.desc,
        img: formInputs.img,
        chat_history: [],
        flag: formInputs.flag
    })
    addRequest.addEventListener('success', () => {
        console.log('Added new sighting to indexedDB')
    })
}
window.addSighting = addSighting

/**
 * Gets all sightings from the database
 */
const getSightings = (readSuccessCallback) => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction([SIGHTINGS_STORE_NAME], "readwrite")
    const localStore = transaction.objectStore(SIGHTINGS_STORE_NAME)

    const getAllRequest = localStore.getAll()
    getAllRequest.addEventListener('success', () => {
        console.log('Get sightings from indexeddb')
        const sightings = getAllRequest.result
        for (const sighting of sightings) {
            readSuccessCallback(sighting)
        }
    })
}
window.getSightings = getSightings

/**
 * Creates necessary object stores
 * @param ev
 */
const handleUpgrade = (ev) => {
    const db = ev.target.result
    db.createObjectStore(USER_STORE_NAME, { keyPath: "id" })
    db.createObjectStore(SIGHTINGS_STORE_NAME, { keyPath: "id", autoIncrement: true})
    console.log('Upgraded object stores')
}

/**
 * Requests opening a connection to the database and sets listeners for
 * 'upgradeneeded', 'success', and 'error' events fired by the request object
 * @param openSuccessCallback called when the database successfully opened
 */
const initIndexedDB = (openSuccessCallback) => {
    requestIDB = indexedDB.open(DB_NAME)
    requestIDB.addEventListener("upgradeneeded", handleUpgrade)
    requestIDB.addEventListener("success", openSuccessCallback)
    requestIDB.addEventListener("error", (err) => {
        console.log("ERROR : " + JSON.stringify(err))
    })
}
window.initIndexedDB = initIndexedDB

//export { initIndexedDB, getUsername, changeUsername, addRandomUsername }
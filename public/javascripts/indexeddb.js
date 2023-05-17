const DB_NAME = 'local'
const USER_STORE_NAME = 'usernames'
const SIGHTINGS_STORE_NAME = 'sightings'

// Stores database open request object
let requestIDB

//const test = (callback) => {
//    const localIDB = requestIDB.result
//    const transaction = localIDB.transaction([USER_STORE_NAME], "readwrite")
//    const localStore = transaction.objectStore(USER_STORE_NAME)
//}
//window.test = test

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
        console.log('Username set to: ' + username)
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
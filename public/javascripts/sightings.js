const sightings_table = document.getElementById("sightings_table")
const username_input = document.getElementById("username_input")
const username_btn_set = document.getElementById("username_btn_set")

$(document).ready(function($) {
    $(".clickable-row").click(function() {
        window.location = $(this).data("href");
    });
});

/**
 * Checks if username is stored in the local database
 */
const hasUsername = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction(["usernames"], "readonly")
    const localStore = transaction.objectStore("usernames")

    // count of items in the store
    const countRequest = localStore.count()
    countRequest.addEventListener("success", (ev) => {
        const count = ev.target.result

        // if count > 0 means username provided so display table
        // else hide table and ask to provide a username for the first time
        if (count > 0) {
                username_btn_set.value = 'Change Username'
                sightings_table.style.display = 'table'

        } else {
                username_btn_set.value = 'Set Username'
                sightings_table.style.display = 'none'
        }
    })
}

/**
 * Sets username for the first time or updates the previous one
 */
const handleSetUsername = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction(["usernames"], "readwrite")
    const localStore = transaction.objectStore("usernames")

    // count of items in the store
    const countRequest = localStore.count()
    countRequest.addEventListener("success", (ev) => {
        const count = ev.target.result

        // if count > 0 update the username
        // else set new username
        if (count > 0) {
            const putRequest = localStore.put({id: 1, username: username_input.value})
            putRequest.addEventListener("success", () => {
                console.log('Username changed to: ' + username_input.value)
                username_btn_set.value = 'Change Username'
                sightings_table.style.display = 'table'
                username_input.value = ''
            })
        } else {
            const addRequest = localStore.add({id: 1, username: username_input.value})
            addRequest.addEventListener("success", () => {
                console.log('Username set to: ' + username_input.value)
                username_btn_set.value = 'Change Username'
                sightings_table.style.display = 'table'
                username_input.value = ''
            })
        }
    })
}

const handleSuccess = () => {
    console.log('Database opened')
    username_btn_set.addEventListener("click", handleSetUsername)
    hasUsername()
}

const handleUpgrade = (ev) => {
    const db = ev.target.result
    db.createObjectStore("usernames", { keyPath: "id" })
    console.log('Upgraded object store')
}

const requestIDB = indexedDB.open("local")
requestIDB.addEventListener("upgradeneeded", handleUpgrade)
requestIDB.addEventListener("success", handleSuccess)
requestIDB.addEventListener("error", (err) => {
    console.log("ERROR : " + JSON.stringify(err))
})
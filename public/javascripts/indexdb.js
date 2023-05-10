const handleSuccess = () => {
    console.log('Success!')
}

const handleUpgrade = (ev) => {
    const db = ev.target.result
    db.createObjectStore("sightings", { keyPath: "id" })
    console.log('Upgraded...')
}

const requestIDB = indexedDB.open("local")
requestIDB.addEventListener("upgradeneeded", handleUpgrade)
requestIDB.addEventListener("success", handleSuccess)
requestIDB.addEventListener("error", (err) => {
    console.log("ERROR : " + JSON.stringify(err))
})

const handleAddSighting = () => {
    const todoIDB = requestIDB.result
    const transaction = todoIDB.transaction(["sightings"], "readwrite")
    const localStore = transaction.objectStore("sightings")
    localStore.add({id: 1, user_nickname: '...'})
    console.log('Sighting added')
}

let handleInit = () => {
    const todoIDB = requestIDB.result
    const transaction = todoIDB.transaction(["tasks"], "readwrite")
    const todoStore = transaction.objectStore("tasks")
    todoStore.add({id: 1, text:"Add some Todos"})
    todoStore.add({id: 2, text:"Delete the initial todos"})
    addMessage("Initialised...")
}
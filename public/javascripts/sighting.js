let map
let username = null
let chatId = null

const socket = io()
const sendChatButton = document.getElementById("chat_send")
const showDialogButton = document.getElementById("show_dialog_btn")
const dialog = document.getElementById("identification_dialog")

const initMap = async () => {
    // The location of sighting
    const lat = parseFloat(document.getElementById("location").getAttribute("data-lat"))
    const lng = parseFloat(document.getElementById("location").getAttribute("data-lng"))
    const position = { lat: lat, lng: lng }

    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps")
    const { Marker } = await google.maps.importLibrary("marker")

    // The map, centered at the sighting location
    map = new Map(document.getElementById("map"), {
        zoom: 15,
        center: position,
        mapId: "LOCATION_SELECTOR",
    });

    // Initialise marker at the sighting coordinates
    let marker = new Marker({
        position: position,
        map: map,
        title: "Sighting location"
    })
}

/**
 * initialises the chat interface with the socket messages
 */
const initChat = () => {

    // get username from IndexedDB
    getUsername()

    // print chat history stored in MongoDB
    let messagesStr = document.getElementById('messages').textContent
    let messages = JSON.parse(messagesStr)

    messages.forEach((message) => {
        let chat_username = message.chat_username
        let chat_text = message.chat_text
        writeOnHistory('<b>'+chat_username+'</b>' + ' ' + chat_text)
    })

    // called when someone joins the room
    socket.on('joined', (room, userId) => {
            // notifies that someone has joined the room
            writeOnHistory('<b>'+userId+'</b>' + ' joined the chat')
    })

    // called when a message is received
    socket.on('chat', (room, userId, chatText) => {
        let who = userId
        writeOnHistory('<b>' + who + ':</b> ' + chatText)
    })
}

/**
 * used to connect to a chat room.
 */
const connectToRoom = () => {
    chatId = document.getElementById('chatId').innerHTML
    socket.emit('create or join', chatId, username)
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
 */
const sendChatText = () => {
    let chatText = document.getElementById('chat_input').value
    socket.emit('chat', chatId, username, chatText)
}

/**
 * it appends the given html text to the history div
 * @param text: the text to append
 */
const writeOnHistory = (text) => {
    let history = document.getElementById('history')
    let paragraph = document.createElement('p')
    paragraph.innerHTML = text
    history.appendChild(paragraph)
    document.getElementById('chat_input').value = ''
}

/**
 * Gets current username from IndexedDB
 */
const getUsername = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction(["usernames"], "readwrite")
    const localStore = transaction.objectStore("usernames")
    const getRequest = localStore.get(1)
    getRequest.addEventListener("success", () => {
        username = getRequest.result.username
        console.log(username)

        // check if the current username created the sighting
        // allow updating identification if yes
        const author = document.getElementById("author_nickname").innerHTML
        if (username === author) {
            showDialogButton.style.display = "inline"
            showDialogButton.addEventListener("click", () => {
                dialog.showModal()
            })
        } else {
            showDialogButton.style.display = "none"
        }

        // connect to chat room when username retrieved from IndexedDB
        connectToRoom()
    })
}

const handleSuccess = () => {
    console.log('Database opened')
    initChat()
}

const handleUpgrade = (ev) => {
    const db = ev.target.result
    db.createObjectStore("usernames", { keyPath: "id" })
    db.createObjectStore("sightings", { keyPath: "id", autoIncrement: true})
    console.log('Upgraded object store')
}

const requestIDB = indexedDB.open("local")
requestIDB.addEventListener("upgradeneeded", handleUpgrade)
requestIDB.addEventListener("success", handleSuccess)
requestIDB.addEventListener("error", (err) => {
    console.log("ERROR : " + JSON.stringify(err))
})

sendChatButton.addEventListener('click', sendChatText)
initMap()
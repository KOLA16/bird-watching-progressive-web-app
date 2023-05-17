//import {initIndexedDB, getUsername} from "./indexeddb"

let map
let visitorUsername = null
let chatId = null

const socket = io()
const sendChatButton = document.getElementById("chat_send")
const showDialogButton = document.getElementById("show_dialog_btn")
const dialog = document.getElementById("identification_dialog")
const author = document.getElementById("author_nickname").innerHTML


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
        writeOnHistory('<b>' + userId + ':</b> ' + chatText)
    })
}

/**
 * used to connect to a chat room.
 */
const connectToRoom = () => {
    chatId = document.getElementById('chatId').innerHTML
    socket.emit('create or join', chatId, visitorUsername)
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
 */
const sendChatText = () => {
    let chatText = document.getElementById('chat_input').value
    socket.emit('chat', chatId, visitorUsername, chatText)
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
 * Verifies if the current user created the visited sighting,
 * and allows updating the identification if true. It also
 * connects to the chat room where the visitor username serves
 * as a chat username
 * @param username
 */
const setVisitorUsername = (username) => {
    visitorUsername = username

    // check if the current username created the sighting
    // allow updating identification if yes
    if (visitorUsername === author) {
        showDialogButton.style.display = "inline"
        showDialogButton.addEventListener("click", () => {
            dialog.showModal()
        })
    } else {
        showDialogButton.style.display = "none"
    }

    // connect to chat room when username retrieved from IndexedDB
    connectToRoom()
    // and enable sending chat messages
    sendChatButton.addEventListener('click', sendChatText)
}

/**
 * Opens IndexedDB database and registers service worker
 */
const initSighting = () => {
    // Check for indexedDB support
    if ('indexedDB' in window) {
        // Get username from the database when opened and verify if is the author,
        // also use it as the chat username
        initIndexedDB(() => {
            getUsername( (username) => {
                setVisitorUsername(username)
            })
        })
    } else {
        console.log('This browser doesn\'t support IndexedDB')
    }

    // Register service worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
}

initChat()
initSighting()
initMap()
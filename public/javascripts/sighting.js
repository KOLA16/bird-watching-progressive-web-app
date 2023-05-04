let map
let username = null
let chatId = null
let socket = io()
let chatButton = document.getElementById("chat_send")

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

    // connect to room when the sighting page is opened
    connectToRoom()

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
 * -
 */
const connectToRoom = () => {
    username = document.getElementById("username").innerHTML
    chatId = document.getElementById("chatId").innerHTML

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

chatButton.addEventListener('click', sendChatText)
initChat()
initMap()
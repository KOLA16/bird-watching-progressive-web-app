let map
let username = null
let chatId = null
let socket = io()
let joinChatButton = document.getElementById("chat_join")
let sendChatButton = document.getElementById("chat_send")

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

    // called when sighting page is opened
    // prints chat history stored in MongoDB
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
 * -
 */
const connectToRoom = () => {

    // replace username input with chat message input
    document.getElementById('chat_username').style.display = 'none'
    document.getElementById('chat_input').style.display = 'inline'

    // replace 'join chat' button with 'send message' button
    joinChatButton.style.display = 'none'
    sendChatButton.style.display = 'inline'

    username = document.getElementById('chat_username').value
    chatId = document.getElementById('chatId').innerHTML

    document.getElementById('chat_username').value = ''
    document.getElementById('chat_label').innerHTML = 'CHAT'

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

joinChatButton.addEventListener('click', connectToRoom)
sendChatButton.addEventListener('click', sendChatText)
initChat()
initMap()
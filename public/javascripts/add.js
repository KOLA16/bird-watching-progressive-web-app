// Initialize and add the map
let map

const authorInput = document.getElementById("author")
const dateInput = document.getElementById("obs_date")
const latInput = document.getElementById("lat")
const lngInput = document.getElementById("lng")
const identificationInput = document.getElementById("bird_species")
const descriptionInput = document.getElementById("desc")
const imageInput = document.getElementById("img")

const submitBtn = document.getElementById("submit_sighting_btn")

const initMap = async () => {
    // The location of Sheffield
    const position = { lat: 53.383331, lng: -1.466667 }
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps")
    const { Marker } = await google.maps.importLibrary("marker")

    // The map, centered at Sheffield
    map = new Map(document.getElementById("map"), {
        zoom: 10,
        center: position,
        mapId: "LOCATION_SELECTOR",
    });

    // Initialise marker at the centre of Sheffield
    let marker = new Marker({
        position: position,
        map: map,
        title: "Sighting location"
    })

    // Change position of the marker after click on map
    map.addListener("click", (e) => {
        placeMarker(e.latLng, map, marker)
    })
}

const placeMarker = (latLng, map, marker) => {
    marker.setPosition(latLng)

    // Fill location form field with marker coordinates
    let lat_input = document.getElementById("lat")
    let lng_input = document.getElementById("lng")
    lat_input.value = latLng.lat()
    lng_input.value = latLng.lng()
}

/**
 * Gets current username from IndexedDB and treats him as an author
 * of the sighting that is being created
 */
const setAuthor = () => {
    const localIDB = requestIDB.result
    const transaction = localIDB.transaction(["usernames"], "readwrite")
    const localStore = transaction.objectStore("usernames")
    const getRequest = localStore.get(1)
    getRequest.addEventListener("success", () => {
        // THIS THROWS ERROR WHEN USERNAME NOT PROVIDED
        // TODO: if usernames empty -> ignore and go with default value ("Unknown")
        const username = getRequest.result.username
        authorInput.value = username
    })
}

const handleSuccess = () => {
    console.log('Database opened')
    setAuthor()
    // submitBtn.addEventListener("click", handleAddSighting)
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

initMap()
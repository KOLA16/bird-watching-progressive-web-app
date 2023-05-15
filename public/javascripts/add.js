let map

const authorInput = document.getElementById("author")
const mapWindow = document.getElementById("map")
const latInput = document.getElementById("lat")
const lngInput = document.getElementById("lng")
const offLabel = document.getElementById("offline_label")

window.addEventListener("offline", () => {
    // TODO: Change to use HTML5 Geolocation instead,
    //  i.e. use the latest online registered location
    mapWindow.style.display = 'none'
    offLabel.style.display = 'inline'
    latInput.style.display = 'inline'
    lngInput.style.display = 'inline'
})

/**
 * Initialises Google Maps map centered over Sheffield, which can be clicked
 * to select a sighting geolocation
 * @returns {Promise<void>}
 */
const initMap = async () => {
    // The location of Sheffield
    const position = { lat: 53.383331, lng: -1.466667 }
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps")
    const { Marker } = await google.maps.importLibrary("marker")

    // The map, centered at Sheffield
    map = new Map(mapWindow, {
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

/**
 * Changes marker position on the map and updates lat and lng
 * values in the sighting form
 * @param latLng
 * @param map
 * @param marker
 */
const placeMarker = (latLng, map, marker) => {
    marker.setPosition(latLng)

    // Fill location form field with marker coordinates
    latInput.value = latLng.lat()
    lngInput.value = latLng.lng()
}

/**
 * Gets current user from IndexedDB and sets him as an author
 * of the sighting that is being created
 */
const setAuthor = (username) => {
    authorInput.value = username
}

/**
 * Opens IndexedDB database and registers service worker
 */
const initAdd = () => {
    // Check for indexedDB support
    if ('indexedDB' in window) {
        // Get username from the database when opened and set as the sighting author
        initIndexedDB(() => {
            getUsername( (username) => {
                setAuthor(username)
            })
        })

        initIndexedDB(getUsername(setAuthor))
    } else {
        console.log('This browser doesn\'t support IndexedDB')
    }

    // Register service worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
}

initAdd()
initMap()
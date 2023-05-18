let map

// form inputs
const authorInput = document.getElementById("author")
const dateInput = document.getElementById("obs_date")
const latInput = document.getElementById("lat")
const lngInput = document.getElementById("lng")
const identificationInput = document.getElementById("bird_species")
const descInput = document.getElementById("desc")
const imgInput = document.getElementById("img")

const mapWindow = document.getElementById("map")
const offLabel = document.getElementById("offline_label")
const submitBtn = document.getElementById("submit_sighting_btn")

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

    console.log(latInput.value)
    console.log(lngInput.value)
}

/**
 * Get form input values and add sighting to the database
 */
const addToDatabase = () => {
    const formInputs = {
        'author': authorInput.value,
        'obs_date': dateInput.value,
        'lat': latInput.value,
        'lng': lngInput.value,
        'bird_species': identificationInput.value,
        'desc': descInput.value,
        'img': imgInput.value,
        'flag': 'online' // indicates that sighting was created when a user was online
    }
    addSighting(formInputs)
}

/**
 * Sets the current user as an author
 * of the sighting that is being created
 * @param username
 */
const setAuthor = (username) => {
    authorInput.value = username

    // Enable adding sightings to the local database
    // submitBtn.addEventListener('click', addToDatabase)
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
    } else {
        console.log('This browser doesn\'t support IndexedDB')
    }

    // Register service worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
}

//// ******** ONLINE/OFFLINE INTERFACE UPDATES ******** /////

window.addEventListener('load', () => {
    // Hides map and displays manual geolocation inputs
    // if user goes offline when he is on the /add page
    window.addEventListener('offline', () => {
        // TODO: Change to use HTML5 Geolocation instead,
        //  i.e. use the latest online registered location
        mapWindow.style.display = 'none'
        offLabel.style.display = 'inline'
        latInput.style.display = 'inline'
        lngInput.style.display = 'inline'
    })

// Shows map and hides manual geolocation inputs
// if user goes online when he is on the /add page
    window.addEventListener('online', () => {
        mapWindow.style.display = 'block'
        offLabel.style.display = 'none'
        latInput.style.display = 'none'
        lngInput.style.display = 'none'
    })

// Checking the online status with navigator,
// allows to hide the map even if user enters the /add page,
// but he is already offline
    if (!navigator.onLine) {
        mapWindow.style.display = 'none'
        offLabel.style.display = 'inline'
        latInput.style.display = 'inline'
        lngInput.style.display = 'inline'
    } else {
        mapWindow.style.display = 'block'
        offLabel.style.display = 'none'
        latInput.style.display = 'none'
        lngInput.style.display = 'none'
    }
})


initAdd()
initMap()
let map

// form inputs
const authorInput = document.getElementById("author")
const latInput = document.getElementById("lat")
const lngInput = document.getElementById("lng")

const mapWindow = document.getElementById("map")
const offLabel = document.getElementById("offline_label")
const offOption = document.getElementById("offline-option")


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
 * Gets all identifications from DBPedia knowledge graph
 */
const getALlIdentifications = () => {
    const endpointUrl = "http://dbpedia.org/sparql";
    const sparqlQuery = `
    SELECT *
    WHERE {
        ?label rdfs:label "List of birds by common name"@en;
        dbo:wikiPageWikiLink ?wikiLink.
    }
    `
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const queryUrl = `${endpointUrl}?query=${encodedQuery}&format=json`;

    $.ajax({
        type: "GET",
        url: queryUrl,
        dataType: "json",
        // contentType: "application/json;charset=UTF-8",
        success: function (response) {
            const results = response.results.bindings;
            const bird_species = results.map((result) => {
                const link = result.wikiLink.value;
                return link.split('/').pop().replace(/_/g, ' ');
            })
            const sorted_bird_species = bird_species.sort();
            $.each(sorted_bird_species, function (_, bird_specie) {
                $('#bird_species').append(`<option value='${bird_specie}'>${bird_specie}</option>`);
            });
        }
    });
}

/**
 * Sets the current user as an author
 * of the sighting that is being created
 * @param username
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
        offOption.style.display = 'inline'
        offLabel.style.display = 'inline'
        latInput.style.display = 'inline'
        lngInput.style.display = 'inline'
    })

// Shows map and hides manual geolocation inputs
// if user goes online when he is on the /add page
    window.addEventListener('online', () => {
        mapWindow.style.display = 'block'
        offOption.style.display = 'none'
        offLabel.style.display = 'none'
        latInput.style.display = 'none'
        lngInput.style.display = 'none'
    })

// Checking the online status with navigator,
// allows to hide the map even if user enters the /add page,
// but he is already offline
    if (!navigator.onLine) {
        mapWindow.style.display = 'none'
        offOption.style.display = 'inline'
        offLabel.style.display = 'inline'
        latInput.style.display = 'inline'
        lngInput.style.display = 'inline'
    } else {
        mapWindow.style.display = 'block'
        offOption.style.display = 'none'
        offLabel.style.display = 'none'
        latInput.style.display = 'none'
        lngInput.style.display = 'none'
    }
})

$(document).ready(function () {
    getALlIdentifications()
});

initAdd()
initMap()
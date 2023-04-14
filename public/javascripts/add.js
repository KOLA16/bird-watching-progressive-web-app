// Initialize and add the map
let map

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

initMap()
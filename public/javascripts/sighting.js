// Initialize and add the map
let map

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

initMap()
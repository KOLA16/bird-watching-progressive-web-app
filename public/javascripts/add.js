// Initialize and add the map
let map;

async function initMap() {
    // The location of Sheffield
    const position = { lat: 53.383331, lng: -1.466667 };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

    // The map, centered at Sheffield
    map = new Map(document.getElementById("map"), {
        zoom: 10,
        center: position,
        mapId: "LOCATION_SELECTOR",
    });

    // The marker, positioned at Sheffield
    const marker = new AdvancedMarkerView({
        map: map,
        position: position,
        title: "Sheffield",
    });
}

initMap();
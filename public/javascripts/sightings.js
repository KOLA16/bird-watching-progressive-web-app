const usernameInput = document.getElementById("username_input")
const usernameBtn = document.getElementById("username_btn_set")
const sightingsTable = document.getElementById("sightings_table")

$(document).ready(function($) {
    $(".clickable-row").click(function() {
        window.location = $(this).data("href");
    });
});

/**
 * Adds event listener to the button changing the initial
 * random username
 */
const enableChangeUsername = () => {
    usernameBtn.addEventListener('click', () => {
        changeUsername(usernameInput.value)
        usernameInput.value = ''
    })
}

/**
 * Appends to table sightings from the local database (added when offline)
 * @param sighting
 */
const appendToTable = (sighting) => {
    // Insert new row to the end of the table
    const newRow = sightingsTable.insertRow(-1)
    newRow.className = "clickable clickable-row"
    newRow.setAttribute("data-href", `/sighting?id=${sighting._id}`)

    // The row <td> elements (cells)
    const td1 = newRow.insertCell(0)
    const td2 = newRow.insertCell(1)
    const td3 = newRow.insertCell(2)
    const td4 = newRow.insertCell(3)

    // Append anchors as the cells children
    td1.innerHTML = sighting.img
    td2.innerHTML = moment(sighting.obs_date).format('D MMM H:mm')
    td3.innerHTML = sighting.bird_species
    td4.innerHTML = sighting.author
}

/**
 * Opens IndexedDB database and registers service worker
 */
const initSightings = () => {
    // Check for indexedDB support
    if ('indexedDB' in window) {
        initIndexedDB(() => {
            // initialise a random username
            addRandomUsername(() => {
                enableChangeUsername()
            })

            getSightings((sighting) => {
                appendToTable(sighting)
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
initSightings()
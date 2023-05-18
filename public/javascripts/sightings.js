const usernameInput = document.getElementById("username_input")
const usernameBtn = document.getElementById("username_btn_set")
const sightingsTable = document.getElementById("sightings_table")
const dateHeader = document.getElementById("date-header")
let ascendingOrder = true

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
    newRow.className = 'sighting-row'
    newRow.addEventListener('click', () => {
        window.location.href = `/sighting?id=${sighting._id}`
    })

    // The row <td> elements (cells)
    const td1 = newRow.insertCell(0)
    const td2 = newRow.insertCell(1)
    const td3 = newRow.insertCell(2)
    const td4 = newRow.insertCell(3)

    // Append anchors as the cells children
    console.log(sighting.img)
    td1.innerHTML = sighting.img
    td2.innerHTML = moment(sighting.obs_date).format('D MMM H:mm')
    td3.innerHTML = sighting.bird_species
    td4.innerHTML = sighting.author
}

/**
 * Sorts table rows by date in ascending/descending order
 */
const sortByDate = () => {
    const tableBody = sightingsTable.getElementsByTagName("tbody")[0]
    const rows = Array.from(tableBody.getElementsByTagName('tr'))

    rows.sort((a, b) => {
        let dateA = new Date(a.cells[1].textContent)
        let dateB = new Date(b.cells[1].textContent)
        if (ascendingOrder) {
            return dateA - dateB
        } else {
            return dateB - dateA
        }
    })

    // Clear existing table body
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Append sorted rows to the table body
    rows.forEach((row) => {
        tableBody.appendChild(row)
    })

    // Toggle sort order
    ascendingOrder = !ascendingOrder
}
dateHeader.addEventListener("click", sortByDate)


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
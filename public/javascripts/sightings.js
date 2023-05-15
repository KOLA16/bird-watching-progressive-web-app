const usernameInput = document.getElementById("username_input")
const usernameBtn = document.getElementById("username_btn_set")

$(document).ready(function($) {
    $(".clickable-row").click(function() {
        window.location = $(this).data("href");
    });
});

// Change initial random username
usernameBtn.addEventListener('click', () => {
    changeUsername(usernameInput.value)
    usernameInput.value = ''
})

/**
 * Opens IndexedDB database and registers service worker
 */
const initSightings = () => {
    // Check for indexedDB support
    if ('indexedDB' in window) {
        initIndexedDB(addRandomUsername)
    } else {
        console.log('This browser doesn\'t support IndexedDB')
    }

    // Register service worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
}
initSightings()
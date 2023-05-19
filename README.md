# Bird Watching PWA

The submission repository for [COM3504 The Intelligent Web](https://www.dcs.shef.ac.uk/intranet/teaching/public/modules/level3/com3504.html) module.

# Team Members

- Igor Kolasa ([ikkolasa1@sheffield.ac.uk](ikkolasa1@sheffield.ac.uk))
- Albertina Elena Ripanu ([aca19aer@sheffield.ac.uk](aca19aer@sheffield.ac.uk]))
- Kambang Ewan ([ekambang1@sheffield.ac.uk](ekambang1@sheffield.ac.uk))
- Wan Tao ([twan2@sheffield.ac.uk](twan2@sheffield.ac.uk))

# Implemented features

- [X] User can add new sightings with all the required details (including image that must be uploaded from disk). When online, geolocation can be selected using a map window provided by the Google Maps API, and the bird identification can be selected from the list of species extracted from DBPedia knowledge graph. When offline, geolocation can be only entered manually, and can mark the identification as to be updated.

- [X] User can view a main page with all the sightings listed. They can be sorted by the observation date.

- [X] When online, user can click on one of the listed sightings which will open a page with all the details. The details will also include abstract and wikipedia link extracted from the DBPedia knowledge graph. If user is an author of the sighting, he can also update its identification. Accessing the details page when offline is only possible if it was visited before when the user was offline (so it could be cached).

- [X] The sighting details page contains a chat window where users can send and view messages in real time. Sent messages are appended to the sighting document stored in the MongoDB server database.

- [X] Service Worker implementing 'Network-First' caching strategy, where requests are served by server. Each successful request updated cache, to which requests are redirected when user is offline.

- [X] IndexedDB database serving two purposes: storing username of the user interacting with the app, and also storing sightings added offline.

# Dependencies

- NodeJS
- MongoDB
- Standard Node modules (see package.json)

# Installation and running

- Install and run MongoDB instance
- Install required node modules: `$ npm install`
- Start the app: `$ npm start`

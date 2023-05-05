const express = require('express')
const router = express.Router()

const sightingController = require('../controllers/sighting')

/* GET all sightings. */
router.get('/', (req, res, next) => {
    sightingController.sightings_get(req, res)
})

module.exports = router
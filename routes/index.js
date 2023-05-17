const express = require('express')
const router = express.Router()
const multer = require('multer')

const sighting = require('../controllers/sighting')

// define storage options to be used for file uploads with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/')
  },
  filename: (req, file, cb) => {
    const original = file.originalname
    const file_extension = original.split(".")
    // Make the file name the date + the file extension
    const filename = Date.now() + '.' + file_extension[file_extension.length-1]
    cb(null, filename)
  }
})
const upload = multer({ storage: storage })

/* GET all sightings. */
router.get('/', (req, res, next) => {
  sighting.sightings_get(req, res)
})

/* GET add sighting page. */
router.get('/add', (req, res, next) => {
  res.render('add', { title: 'Add new bird sighting' })
})

/* POST new sighting to the database. */
router.post('/add', upload.single('img'), (req, res) => {
  sighting.sighting_create_post(req, res)
})

/* GET selected sighting. */
router.get('/sighting', (req, res, next) => {
  sighting.sighting_get(req, res)
})

/* UPDATE selected sighting. */
router.post('/sighting', (req, res, next) => {
  sighting.sighting_update_identification(req, res)
})

app.get('/sightings', (req, res) => {
  res.render('sightings');
});


module.exports = router
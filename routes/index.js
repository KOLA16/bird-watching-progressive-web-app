const express = require('express')
const router = express.Router()

const sighting = require('../controllers/sighting')

/* GET home page. */
router.get('/index', (req, res, next) => {
  res.render('index', { title: 'Bird Sighting App' })
})

/* GET add sighting page. */
router.get('/add', (req, res, next) => {
  res.render('add', { title: 'Add new bird sighting' })
})

/* POST new sighting to the database. */
router.post('/add', (req, res) => {
  sighting.sighting_create_post(req, res)
})

module.exports = router
const moment = require('moment');

const Sighting = require('../models/sighting')

// Handle Sighting create on POST.
exports.sighting_create_post = async (req, res) => {
    const formData = req.body
    // Set to null if image not uploaded
    const imgPath = req.file ? req.file.path : null

    const sighting = new Sighting({
        user_nickname: formData.nickname,
        observation_date: formData.obs_date,
        location: {
            type: 'Point',
            coordinates: [formData.lat, formData.lng]
        },
        identification: formData.bird_species,
        description: formData.desc,
        image: imgPath
    })

    try {
        const newSighting = await sighting.save()
        const id = newSighting._id
        res.redirect('/sighting?id=' + id)
    } catch (err) {
        res.status(500).send('Invalid data!')
    }
}

// Handle Sighting GET.
exports.sighting_get = async (req, res) => {
    const sighting_id = req.query.id

    try {
        const selectedSighting = await Sighting.findById(sighting_id).exec()
        // Display 'image not available' if image not provided
        const img = selectedSighting.image ?
            selectedSighting.image.replace('public', '') : '/uploads/image-not-available.jpg'

        console.log(img)
        res.render(
            'sighting',
            {
                title: 'Sighting Page',
                nickname: selectedSighting.user_nickname,
                date: selectedSighting.observation_date,
                lat: selectedSighting.location.coordinates[0],
                lng: selectedSighting.location.coordinates[1],
                identification: selectedSighting.identification,
                description: selectedSighting.description,
                image: img
            })
    } catch (err) {
        res.status(500).send('Sighting not found!')
    }
}

// Handle all Sightings GET.
exports.sightings_get = async (req, res) => {
    try {
        const sightings = await Sighting.find({}).sort({ observation_date: -1,  }).exec()
        sightings.forEach((sighting) => {
            // Display 'image not available' if image not provided
            sighting.image = sighting.image ? sighting.image.replace('public', '') : '/uploads/image-not-available.jpg'
        })
        console.log(sightings)

        res.render(
            'sightings',
            {
                title: 'Sightings',
                sightings,
                moment: moment
            })
    } catch (err) {
        res.status(500).send('Sightings not found!')
    }
}
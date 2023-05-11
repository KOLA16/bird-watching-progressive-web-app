const moment = require('moment');

const Sighting = require('../models/sighting')

// Handle Sighting create on POST.
exports.sighting_create_post = async (req, res) => {
    const formData = req.body
    // Set to null if image not uploaded
    const imgPath = req.file ? req.file.path : null

    const sighting = new Sighting({
        user_nickname: formData.author,
        observation_date: formData.obs_date,
        location: {
            type: 'Point',
            coordinates: [formData.lat, formData.lng]
        },
        identification: formData.bird_species,
        description: formData.desc,
        image: imgPath,
        chat_history: []
    })

    try {
        const newSighting = await sighting.save()
        const id = newSighting._id
        res.redirect('/sighting?id=' + id)
    } catch (err) {
        console.log(err.errors)
        res.status(500).send('Invalid data!')
    }
}

// Handle Sighting identification UPDATE.
exports.sighting_update_identification = async (req, res) => {
    const sighting_id = req.body.sighting_id
    const new_identification = req.body.new_identification

    try {
        await Sighting.findByIdAndUpdate( sighting_id, { identification: new_identification} ).exec()
        res.redirect('/sighting?id=' + sighting_id)
    } catch (err) {
        console.log(err)
    }
}

// Handle Sighting chat history UPDATE.
exports.sighting_update_chat_history = async (chatDetails) => {
    const sighting_id = chatDetails.sighting_id
    const chat_username = chatDetails.chat_username
    const chat_text = chatDetails.chat_text
    const message = { chat_username: chat_username, chat_text: chat_text }

    try {
        await Sighting.findByIdAndUpdate( sighting_id,
            { $push: {
                             chat_history: message
            }
        }).exec()
    } catch (err) {
        console.log(err)
    }
}

// Handle Sighting GET.
exports.sighting_get = async (req, res) => {
    let sighting_id = req.query.id

    try {
        const selectedSighting = await Sighting.findById(sighting_id).exec()
        // Display 'image not available' if image not provided
        const img = selectedSighting.image ?
            selectedSighting.image.replace('public', '') : '/uploads/image-not-available.jpg'

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
                image: img,
                sightingId: sighting_id,
                messages: selectedSighting.chat_history
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
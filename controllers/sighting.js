const Sighting = require('../models/sighting')

// Handle Sighting create on POST.
exports.sighting_create_post = async (req, res) => {
    const formData = req.body
    const sighting = new Sighting({
        user_nickname: formData.nickname,
        observation_date: formData.obs_date,
        location: {
            type: 'Point',
            coordinates: [formData.lat, formData.lng]
        },
        identification: formData.bird_species,
        description: formData.desc,
        image: req.file.path
    })

    try {
        const newSighting = await sighting.save()
        res.send('New sighting successfully added!')
    } catch (err) {
        res.status(500).send('Invalid data!')
    }

}
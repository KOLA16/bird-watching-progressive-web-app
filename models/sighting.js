const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sightingSchema = new Schema({
    user_nickname: {type: String, required: true, max: 100 },
    observation_date: { type: Date, required: true },
    location: {
        type: {
            type: String,
        },
        coordinates: {
            type: [Number]
        },
    },
    identification: { type: String, default: 'unknown' },
    description: { type: String, required: true, max: 5000 },
    image: { type: String }
})

const Sighting = mongoose.model('Sighting', sightingSchema)

module.exports = Sighting
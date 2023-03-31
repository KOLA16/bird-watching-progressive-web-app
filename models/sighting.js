const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sightingSchema = new Schema({
    user_nickname: {type: String, required: true, max: 50 },
    observation_date: { type: Date, required: true },
    location: {
        type: {
            type: String,
        },
        coordinates: {
            type: [Number]
        },
    },
    image: { type: Buffer },
    identification: { type: String, default: 'unknown' },
    description: { type: String, required: true }
})

const Sighting = mongoose.model('Sighting', sightingSchema)

module.exports = Sighting
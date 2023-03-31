const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sightingSchema = new Schema({
    user_nickname: {type: String, required: true, max: 50 },
    date: { type: Date },
    location: {
        type: {
            type: String,
        },
        coordinates: {
            type: [Number]
        }
    },
    image: { type: Buffer },
    identification: { type: String, default: 'unknown' },
    description: { type: String }
})

const Sighting = mongoose.model(('Sighting', sightingSchema))

module.exports = Sighting
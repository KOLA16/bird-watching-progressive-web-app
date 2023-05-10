const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sightingSchema = new Schema({
    user_nickname: {type: String, required: true, max: 100 },
    observation_date: { type: Date, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    identification: { type: String },
    description: { type: String, required: true, max: 5000 },
    image: { type: String },
    chat_history: { type: [{chat_username: String, chat_text: String}] }
})

// 2dsphere index for speeding up geospatial queries
sightingSchema.index({ location: '2dsphere' })

const Sighting = mongoose.model('Sighting', sightingSchema)

module.exports = Sighting
const moment = require('moment')
const https = require('https')

const Sighting = require('../models/sighting')

/**
 * Handles POST request to create new sighting in the database,
 * and redirects to the main (/) page after success
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
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
        res.redirect('/')
    } catch (err) {
        console.log(err.errors)
        res.status(500).send('Invalid data!')
    }
}

/**
 * Handles request to update sighting identification,
 * and reloads the sighting page after the update
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
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

/**
 * Adds each new chat message to the corresponding sighting in the database
 * @param chatDetails
 * @returns {Promise<void>}
 */
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

/**
 *
 * @param req
 * @param res
 */
exports.add_get = (req, res) => {
    res.render('add', {title: 'Add new bird sighting'})
}

/**
 * Gets details of the selected sighting from the database and
 * passes it to function handling DBPedia information retrieval
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.sighting_get = async (req, res) => {
    let sighting_id = req.query.id

    try {
        const selectedSighting = await Sighting.findById(sighting_id).exec()
        get_dbpedia_info_and_render(res, sighting_id, selectedSighting, selectedSighting.identification)

    } catch (err) {
        res.status(500).send('Sighting not found!', err)
    }
}

/**
 * Requests an abstract and wikipedia link from the DBPedia for the selected sighting
 * and renders the sighting page with all the details
 * @param res
 * @param sighting_id
 * @param selectedSighting
 * @param identification
 */
const get_dbpedia_info_and_render = (res, sighting_id, selectedSighting, identification) => {

    const sparqlQuery = `SELECT  ?wiki_link (REPLACE(?abstract, "@en", "") AS ?abstract) 
    WHERE {
      ?dbpedia_link rdf:type dbo:Bird ;
                    foaf:isPrimaryTopicOf ?wiki_link ;
                    dbp:name "${identification}"@en  ;
                    dbo:abstract ?abstract .
      FILTER(lang(?abstract) = 'en')
    }`

    const requestOptions = {
        hostname: 'dbpedia.org',
        path: '/sparql?query=' + encodeURIComponent(sparqlQuery),
        headers: {
            'Accept': 'application/json'
        }
    }

    https.get(requestOptions, resp => {
        let data = ''
        let link = ''
        let abstract = ''

        resp.on('data', chunk => {
            data += chunk

            try {
                // Get wikipedia link
                link = JSON.parse(data).results.bindings[0].wiki_link.value
            } catch (err) {
                link = 'Wiki Link Not Found'
                console.log('Wiki link not available for: ', identification)
            }

            try {
                // Get abstract
                abstract = JSON.parse(data).results.bindings[0].abstract.value
            } catch (err) {
                abstract = 'Abstract Not Found'
                console.log('Abstract not available for: ', identification)
            }

        })

        resp.on('end', () => {

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
                    abstract: abstract,
                    link: link,
                    description: selectedSighting.description,
                    image: img,
                    sightingId: sighting_id,
                    messages: selectedSighting.chat_history
                })
        })

        }).on('error', err => {
        console.log('Error: ', err.message)
    })
}

/**
 * Gets all sightings from the database and renders the main page
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
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
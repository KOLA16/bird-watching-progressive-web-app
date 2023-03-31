const mongoose = require('mongoose')

const mongoDB = 'mongodb://localhost:27017/appdb'

const run = async () => {
    await mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    })
}
run().catch(err => console.log('Connection to mongodb error: ' + err))
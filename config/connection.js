const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/EduSphere")
        //await mongoose.connect(process.env.MONGODB_URI)
        console.log('connect to MongoDB successfully')
    }
    catch (err) {
        console.log("connection to MongoDB failed")
        console.log(err)
    }
}

module.exports = { connect }

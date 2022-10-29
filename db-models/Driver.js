const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DriverSchema = new Schema({
    phoneNumber: {
        type: String
    },
    countryCode: {
        type: String
    },
    name: {
        type: String
    },
    photo: {
        type: Map
    },
    jwtValidFrom: {
        type: Number,
        default: Date.now
    },
    createdAt: {
        type: Number,
        default: Date.now
    }
})

mongoose.models = {}

const Driver = mongoose.model("drivers", DriverSchema)

module.exports = Driver
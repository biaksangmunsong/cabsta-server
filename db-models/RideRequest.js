const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RideRequestSchema = new Schema({
    driver: {
        type: String,
        required: true
    },
    passenger: {
        type: String,
        required: true
    },
    details: {
        type: Map,
        required: true
    },
    lastUpdated: {
        type: Number,
        default: Date.now
    },
    iat: {
        type: Date,
        expires: 300,
        default: new Date
    }
})

mongoose.models = {}

const RideRequest = mongoose.model("ride-requests", RideRequestSchema)

module.exports = RideRequest
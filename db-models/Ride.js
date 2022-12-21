const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const RideSchema = new Schema({
    status: {
        type: String,
        default: "initiated"
    },
    driverId: {
        type: ObjectId,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    details: {
        type: Map,
        required: true
    },
    requestIat: {
        type: Number,
        required: true
    },
    iat: {
        type: Number,
        default: Date.now
    },
    expiration: {
        type: Date,
        expires: 43200,
        default: new Date
    }
})

mongoose.models = {}

const Ride = mongoose.model("rides", RideSchema)

module.exports = Ride
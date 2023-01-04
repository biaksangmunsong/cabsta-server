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
    requestedAt: {
        type: Number,
        required: true
    },
    acceptedAt: {
        type: Number,
        default: Date.now
    },
    cancellation: {
        type: Map,
        required: null
    },
    completedAt: {
        type: Number,
        required: false
    }
})

mongoose.models = {}

const Ride = mongoose.model("rides", RideSchema)

module.exports = Ride
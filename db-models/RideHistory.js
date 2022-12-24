const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const RideHistorySchema = new Schema({
    status: {
        type: String,
        required: true
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
    reasonForCancellation: {
        type: String,
        required: false
    },
    requestIat: {
        type: Number,
        required: true
    },
    acceptedAt: {
        type: Number,
        required: true
    },
    iat: {
        type: Number,
        default: Date.now
    }
})

mongoose.models = {}

const RideHistory = mongoose.model("history-rides", RideHistorySchema)

module.exports = RideHistory
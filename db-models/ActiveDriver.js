const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ActiveDriverSchema = new Schema({
    driverId: {
        type: String,
        required: true
    },
    driverData: {
        type: Map,
        required: true
    },
    location: {
        type: Map,
        required: true
    },
    lastUpdated: {
        type: Number,
        default: Date.now
    },
    createdAt: {
        type: Number,
        default: Date.now
    }
})

mongoose.models = {}

const ActiveDriver = mongoose.model("active-drivers", ActiveDriverSchema)

module.exports = ActiveDriver
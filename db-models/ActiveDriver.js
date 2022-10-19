const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ActiveDriverSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    userData: {
        type: Map,
        required: true
    },
    location: {
        type: Map,
        required: true
    },
    lastUpdated: {
        type: Date,
        expires: 60,
        default: new Date
    }
})

mongoose.models = {}

const ActiveDriver = mongoose.model("active-drivers", ActiveDriverSchema)

module.exports = ActiveDriver
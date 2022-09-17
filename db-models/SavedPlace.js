const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SavedPlaceSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    title: {
        type: "String",
        required: true
    },
    formattedAddress: {
        type: "String",
        required: true
    },
    location: {
        type: Map,
        required: true
    },
    lastModified: {
        type: Number,
        default: Date.now
    },
    createdAt: {
        type: Number,
        default: Date.now
    }
})

mongoose.models = {}

const SavedPlace = mongoose.model("saved-places", SavedPlaceSchema)

module.exports = SavedPlace
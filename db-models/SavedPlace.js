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
    coords: {
        type: Map,
        required: true
    },
    createdAt: {
        type: Date,
        expires: "1m",
        default: new Date
    }
})

mongoose.models = {}

const SavedPlace = mongoose.model("saved-places", SavedPlaceSchema)

module.exports = SavedPlace
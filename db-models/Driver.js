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
    dob: {
        type: Number
    },
    gender: {
        type: String
    },
    vehicle: {
        type: Map
    },
    vehicleType: {
        type: String
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
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OtpSchema = new Schema({
    id: {
        type: String
    },
    for: {
        type: String
    },
    otp: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    countryCode: {
        type: String
    },
    lastSent: {
        type: Number,
        default: Date.now
    },
    createdAt: {
        type: Date,
        expires: 300,
        default: new Date
    }
})

mongoose.models = {}

const Otp = mongoose.model("otps", OtpSchema)

module.exports = Otp
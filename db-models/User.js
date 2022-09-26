const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
    phoneNumber: {
        type: String
    },
    countryCode: {
        type: String
    },
    name: {
        type: String
    },
    profilePhoto: {
        type: Map
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

const User = mongoose.model("users", UserSchema)

module.exports = User
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TestSchema = new Schema({
    message: {
        type: "String",
        default: "This document is created after 1 hour"
    },
    createdAt: {
        type: Number,
        default: Date.now
    }
})

mongoose.models = {}

const Test = mongoose.model("tests", TestSchema)

module.exports = Test
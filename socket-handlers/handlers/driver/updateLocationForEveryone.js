const mongoose = require("mongoose")
const ActiveDriver = require("../../../db-models/ActiveDriver")

module.exports = async (_id, coords) => {
    
    try {
        if (!mongoose.Types.ObjectId.isValid(_id) || typeof(coords) !== "object") return
        
        const lat = Number(coords.lat) || NaN
        const lng = Number(coords.lng) || NaN

        // validate latitude and longitude input
        if (
            (
                !lat ||
                !lng
            ) ||
            (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            )
        ) return

        // update location
        await ActiveDriver.findOneAndUpdate({_id}, {
            location: {
                type: "Point",
                coordinates: [lng,lat]
            },
            lastUpdated: Date.now()
        }, {
            upsert: false
        })
    }
    catch {}

}
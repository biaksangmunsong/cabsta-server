const ObjectId = require('mongoose').Types.ObjectId
const validateCoords = require("../../../lib/validateCoords")

module.exports = async (coords, driverId, userId, io, redisClient) => {
    
    try {
        // validate coords
        if (!validateCoords(coords)) return

        // validate userId
        if (!ObjectId.isValid(userId)) return

        // send new location to passenger
        io.in(userId).emit("drivers-live-location", coords)

        // write drivers live location to redis
        await redisClient.sendCommand([
            "SET",
            `drivers_live_location:${driverId}`,
            JSON.stringify({
                ...coords,
                millis: Date.now()
            }),
            "XX"
        ])
    }
    catch {}

}
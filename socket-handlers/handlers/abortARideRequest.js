const ObjectId = require('mongoose').Types.ObjectId

module.exports = async (driverId, redisClient, socket) => {
    
    try {
        // validate driverId
        if (!ObjectId.isValid(driverId)){
            return socket.emit("ride-request-response", {
                status: "error",
                message: "Invalid input"
            })
        }

        // delete ride request
        const requestId = `ride_request:${driverId}`
        await redisClient.sendCommand([
            "DEL",
            requestId
        ])

        // broadcast to everyone that driver is available
        socket.broadcast.emit("driver-available", driverId)
    }
    catch {}

}
const ObjectId = require('mongoose').Types.ObjectId

module.exports = async (driverId, redisClient, socket, io) => {
    
    try {
        // validate driverId
        if (!ObjectId.isValid(driverId)) return
        
        // delete ride request
        const requestId = `ride_request:${driverId}`
        await redisClient.sendCommand([
            "DEL",
            requestId
        ])

        // send to driver that request is aborted
        io.in(driverId).emit("passenger-aborted-a-ride-request")
        
        // broadcast to everyone that driver is available
        socket.broadcast.emit("driver-available", driverId)
    }
    catch {}

}
const checkDriverActive = require("../../../lib/checkDriverActive")

module.exports = async (io, driverId, redisClient) => {
    
    try {
        // check if the request still exists
        let request = await redisClient.sendCommand([
            "GET",
            `ride_request:${driverId}`
        ])
        if (!request) return
        
        // parse ride request data
        request = JSON.parse(request)
        
        // remove request from redis
        await redisClient.sendCommand([
            "DEL",
            `ride_request:${driverId}`
        ])

        // let the passenger know that ride is rejected
        io.in(request.user._id).emit("ride-request-rejected", driverId)

        // check if driver is still active and if so, let everyone know
        const driverActive = await checkDriverActive(driverId, redisClient)
        if (driverActive.coords){
            io.emit("driver-available", driverId)
        }
    }
    catch {}

}
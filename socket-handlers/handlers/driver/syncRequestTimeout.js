module.exports = async (io, driverId, redisClient) => {
    
    try {
        // get ttl of request
        const ttl = await redisClient.sendCommand([
            "TTL",
            `ride_request:${driverId}`
        ])
        if (ttl < 2) return
        
        // get ride request
        let request = await redisClient.sendCommand([
            "GET",
            `ride_request:${driverId}`
        ])

        if (!request) return
        
        request = JSON.parse(request)

        // send ttl to passenger and driver
        io.in(request.driver._id).in(request.user._id).emit("sync-request-timeout", {
            value: ttl,
            start: Number(process.env.RIDE_REQUEST_TIMEOUT)
        })
    }
    catch {}

}
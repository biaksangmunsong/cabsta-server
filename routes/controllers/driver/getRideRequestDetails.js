const checkDriverActive = require("../../../lib/checkDriverActive")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        
        // check if driver is active
        const driverActiveCheck = await checkDriverActive(driverId, redisClient)
        if (!driverActiveCheck.coords){
            return next({
                status: 400,
                data: {
                    code: "driver-offline",
                    message: "Your are offline"
                }
            })
        }
        
        const requestId = `ride_request:${driverId}`
        const rideRequestDetails = await redisClient.sendCommand([
            "GET",
            requestId
        ])
        const ttl = await redisClient.sendCommand([
            "TTL",
            requestId
        ])
        
        if (!rideRequestDetails || ttl < 2){
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                data: null,
                ttl: {
                    value: ttl,
                    start: Number(process.env.RIDE_REQUEST_TIMEOUT)
                },
                serverMillis: Date.now()
            })
        }
        else {
            const parsedRideRequestDetails = JSON.parse(rideRequestDetails)
            const data = {
                ...parsedRideRequestDetails,
                user: {
                    ...parsedRideRequestDetails.user,
                    phoneNumber: undefined,
                    countryCode: undefined
                },
                driver: undefined
            }
            
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                data,
                ttl: {
                    value: ttl,
                    start: Number(process.env.RIDE_REQUEST_TIMEOUT)
                },
                serverMillis: Date.now()
            })
        }
    }
    catch (err){
        console.log(err)
        next({
            status: 500,
            data: {
                message: "Internal Server Error"
            }
        })
    }

}
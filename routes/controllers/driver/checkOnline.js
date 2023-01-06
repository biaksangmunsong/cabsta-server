const checkDriverActive = require("../../../lib/checkDriverActive")
const Ride = require("../../../db-models/Ride")
const calculateEarnings = require("../../../lib/calculateEarnings")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId

        const check = await checkDriverActive(driverId, redisClient)

        // check if there are any uncompleted rides
        let uncompletedRide = await Ride.findOne({
            driverId,
            status: "initiated"
        })
        let rideRequest = null
        if (uncompletedRide){
            uncompletedRide = uncompletedRide.toJSON()
        }
        else {
            // check if there is a ride request
            const requestId = `ride_request:${driverId}`
            rideRequest = await redisClient.sendCommand([
                "GET",
                requestId
            ])
            if (rideRequest){
                const parsedRideRequest = JSON.parse(rideRequest)
                rideRequest = {
                    usersPhoto: parsedRideRequest.user.photo ? parsedRideRequest.user.photo.thumbnail_url : "",
                    serverMillis: Date.now()
                }
            }
        }

        // get earnings for today
        const todaysEarning = await calculateEarnings(driverId, "today")
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            ...check,
            uncompletedRide,
            rideRequest,
            todaysEarning
        })
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
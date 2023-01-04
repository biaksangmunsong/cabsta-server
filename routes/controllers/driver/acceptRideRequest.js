const Ride = require("../../../db-models/Ride")
const getDriverOffline = require("../../../lib/getDriverOffline")
const checkDriverActive = require("../../../lib/checkDriverActive")
const reasonsForCancellation = require("../../../lib/reasonsForCancellation")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        const socketIo = req.socketIo
        const requestId = `ride_request:${driverId}`

        // check if request still exists
        let request = await redisClient.sendCommand([
            "GET",
            requestId
        ])
        if (!request){
            return next({
                status: 410,
                data: {
                    code: "request-not-exists",
                    message: "The request has expired, or passenger aborted the request."
                }
            })
        }
        request = JSON.parse(request)

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
        
        // create ride data and save it to database
        const newRide = new Ride({
            driverId: request.driver._id,
            userId: request.user._id,
            details: {
                ...request,
                requestIat: undefined
            },
            requestedAt: request.requestedAt
        })
        await newRide.save()

        const responseData = newRide.toJSON()

        // write driver's live location to redis
        const driversLiveLocation = {
            lat: driverActiveCheck.coords.latitude,
            lng: driverActiveCheck.coords.longitude,
            speed: 0,
            millis: Date.now()
        }
        await redisClient.sendCommand([
            "SET",
            `drivers_live_location:${request.driver._id}`,
            JSON.stringify(driversLiveLocation)
        ])
        
        // notify passenger
        socketIo.in(request.user._id).emit("ride-request-accepted", {
            ...responseData,
            driversLiveLocation,
            reasonsForCancellation
        })
        
        // remove ride request from redis
        await redisClient.sendCommand([
            "DEL",
            requestId
        ])
        
        // get driver offline
        await getDriverOffline(driverId, redisClient)
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(responseData)
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
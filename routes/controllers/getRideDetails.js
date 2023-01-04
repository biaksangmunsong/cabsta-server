const ObjectId = require('mongoose').Types.ObjectId
const Ride = require("../../db-models/Ride")
const reasonsForCancellation = require("../../lib/reasonsForCancellation")

module.exports = async (req, res, next) => {
    
    try {
        const userId = req.userId
        const rideId = String(req.query.rideId || "")
        const redisClient = req.redisClient

        // validate rideId
        if (!ObjectId.isValid(rideId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // get ride details from database
        const rideDetails = await Ride.findOne({
            _id: rideId,
            userId
        })
        if (!rideDetails){
            return next({
                status: 404,
                data: {
                    message: "Ride details not found"
                }
            })
        }
        const responseData = rideDetails.toJSON()
        if (responseData.cancellation){
            responseData.cancellation.reason = undefined
        }
        if (responseData.status !== "initiated"){
            responseData.details.user.phoneNumber = undefined
            responseData.details.user.countryCode = undefined
            responseData.details.driver.phoneNumber = undefined
            responseData.details.driver.countryCode = undefined
        }
        responseData.reasonsForCancellation = reasonsForCancellation
        
        // get driver's live location
        const driversLiveLocation = await redisClient.sendCommand([
            "GET",
            `drivers_live_location:${responseData.driverId}`
        ])
        if (driversLiveLocation){
            responseData.driversLiveLocation = JSON.parse(driversLiveLocation)
        }
        
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
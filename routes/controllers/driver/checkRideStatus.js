const ObjectId = require('mongoose').Types.ObjectId
const Ride = require("../../../db-models/Ride")

module.exports = async (req, res, next) => {
    
    try {
        const driverId = req.driverId
        const rideId = String(req.query.rideId || "")

        // validate ride id
        if (!ObjectId.isValid(rideId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // get ride data from database
        let ride = await Ride.findOne({
            _id: rideId,
            driverId
        })
        if (!ride){
            return next({
                status: 404,
                data: {
                    message: "Ride details not found"
                }
            })
        }
        ride = ride.toJSON()
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            _id: String(ride._id),
            status: ride.status,
            completedAt: ride.completedAt,
            cancellation: ride.cancellation ? {
                ...ride.cancellation,
                reason: undefined
            } : undefined
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
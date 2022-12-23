const checkDriverActive = require("../../../lib/checkDriverActive")
const Ride = require("../../../db-models/Ride")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId

        const check = await checkDriverActive(driverId, redisClient)

        // check if there are any uncompleted rides
        let uncompletedRide = await Ride.findOne({driverId})
        if (uncompletedRide){
            uncompletedRide = uncompletedRide.toJSON()
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            ...check,
            uncompletedRide
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
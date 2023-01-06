const ObjectId = require('mongoose').Types.ObjectId
const Ride = require("../../../db-models/Ride")
const calculateEarnings = require("../../../lib/calculateEarnings")

module.exports = async (req, res, next) => {
    
    try {
        const driverId = req.driverId
        const rideId = req.body.rideId
        const redisClient = req.redisClient
        const socketIo = req.socketIo
        
        // validate rideId
        if (!ObjectId.isValid(rideId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }
        
        // update status
        const now = Date.now()
        const ride = await Ride.findOneAndUpdate({
            _id: rideId,
            driverId,
            status: "initiated"
        }, {
            status: "completed",
            completedAt: now
        })
        if (!ride){
            return next({
                status: 404,
                data: {
                    message: "Ride already cancelled or completed, or it does not exist."
                }
            })
        }
        const rideData = ride.toJSON()
        const userId = String(rideData.userId)
        
        // delete driver's live location from redis
        await redisClient.sendCommand([
            "DEL",
            `drivers_live_location:${driverId}`
        ])
        
        // send to passenger that ride is completed
        socketIo.in(userId).emit("ride-completed", {
            rideId,
            completedAt: now
        })
        socketIo.in(userId).emit("refresh-history")
        
        try {
            const todaysEarning = await calculateEarnings(driverId, "today")
            
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({todaysEarning})
        }
        catch {
            // send response anyway
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                todaysEarning: null
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
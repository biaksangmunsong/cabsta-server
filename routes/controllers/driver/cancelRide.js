const ObjectId = require('mongoose').Types.ObjectId
const Ride = require("../../../db-models/Ride")

module.exports = async (req, res, next) => {
    
    try {
        const driverId = req.driverId
        const rideId = req.body.rideId
        const reason = String(req.body.reason || "")
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

        // validate reason
        if (!reason){
            return next({
                status: 406,
                data: {
                    message: "Please specify a reason for cancellation"
                }
            })
        }
        if (reason.length > 500){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // update status
        const ride = await Ride.findOneAndUpdate({
            _id: rideId,
            driverId,
            status: "initiated"
        }, {
            status: "cancelled",
            cancellation: {
                iat: Date.now(),
                iby: "driver",
                reason
            }
        })
        if (!ride){
            return next({
                status: 404,
                data: {
                    message: "Ride already cancelled, or it does not exist."
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

        // send to passenger that ride is cancelled
        const cancellation = {
            iat: Date.now(),
            iby: "driver"
        }
        socketIo.in(userId).emit("ride-cancelled", {
            rideId,
            cancellation
        })
        socketIo.in(userId).emit("refresh-history")
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .send("OK")
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
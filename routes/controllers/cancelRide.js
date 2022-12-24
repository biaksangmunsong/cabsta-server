const ObjectId = require('mongoose').Types.ObjectId
const Ride = require("../../db-models/Ride")
const { getMessaging } = require("firebase-admin/messaging")

module.exports = async (req, res, next) => {
    
    try {
        const userId = req.userId
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
        if (reason.length > 1000){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // get ride details from database
        const ride = await Ride.findOneAndUpdate({
            _id: rideId,
            userId
        }, {
            status: "cancelled"
        })
        if (!ride){
            return next({
                status: 404,
                data: {
                    code: "already-cancelled",
                    message: "Ride already cancelled"
                }
            })
        }
        const rideData = ride.toJSON()
        const driverId = String(ride.driverId)
        
        // delete driver's live location from redis
        await redisClient.sendCommand([
            "DEL",
            `drivers_live_location:${driverId}`
        ])

        // send to driver that ride is cancelled
        const driverFcmToken = await redisClient.sendCommand([
            "GET",
            `driver_fcm_token:${driverId}`
        ])
        if (driverFcmToken){
            try {
                const fcmMessage = {
                    token: driverFcmToken,
                    notification: {
                        title: "Ride Cancelled",
                        body: `${rideData.details.user.name} cancelled a ride.`
                    },
                    data: {
                        for: "ride-cancellation",
                        rideId
                    },
                    android: {
                        ttl: 86400*1000, // one day (non-negative duration in milliseconds)
                        priority: "high",
                        notification: {
                            sound: "twinkle.mp3",
                            channel_id: "ride-cancellation",
                            tag: "ride-cancellation"
                        }
                    }
                }
                await getMessaging().send(fcmMessage)
                socketIo.in(driverId).emit("ride-cancelled", rideId)
            }
            catch {}
        }
        
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
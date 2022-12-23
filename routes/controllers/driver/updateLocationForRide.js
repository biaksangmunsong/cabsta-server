const ObjectId = require('mongoose').Types.ObjectId
const validateCoords = require("../../../lib/validateCoords")

module.exports = async (req, res, next) => {
    
    try {
        const location = req.body.location
        const userId = req.body.userId
        const driverId = req.driverId
        const redisClient = req.redisClient
        const socketIo = req.socketIo
        
        // validate location
        if (!validateCoords(location)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // validate userId
        if (!ObjectId.isValid(userId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }
        
        const data = {
            lat: location.lat,
            lng: location.lng,
            speed: Number(location.speed) || 0,
            millis: Date.now()
        }
        
        // send new location to passenger
        socketIo.in(userId).emit("drivers-live-location", data)
        
        // write drivers live location to redis
        await redisClient.sendCommand([
            "SET",
            `drivers_live_location:${driverId}`,
            JSON.stringify(data),
            "XX"
        ])
        
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
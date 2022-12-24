const Driver = require("../../../db-models/Driver")
const Ride = require("../../../db-models/Ride")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const socketIo = req.socketIo
        const driverId = req.driverId
        const lat = Number(req.body.lat) || NaN
        const lng = Number(req.body.lng) || NaN

        // validate latitude and longitude input
        if (
            (
                !lat ||
                !lng
            ) ||
            (
                lat < -85 ||
                lat > 85 ||
                lng < -180 ||
                lng > 180
            )
        ){
            return next({
                status: 406,
                data: {
                    message: "Invalid input data"
                }
            })
        }

        // check if driver has any uncompleted rides
        const uncompletedRide = await Ride.findOne({
            driverId,
            status: "initiated"
        })
        if (uncompletedRide){
            return next({
                status: 405,
                data: {
                    uncompletedRide: uncompletedRide._id,
                    message: "You cannot get online while you have uncompleted rides."
                }
            })
        }
        
        // get vehicle type
        const driver = await Driver.findOne({_id: driverId})
        if (!driver){
            return next({
                status: 404,
                data: {
                    message: "Driver not found"
                }
            })
        }

        const key = `active_${driver.vehicleType}_drivers`
        
        await redisClient.sendCommand([
            "GEOADD",
            key,
            String(lng),
            String(lat),
            driverId
        ])
        
        // send to everyone that driver is available
        socketIo.emit("driver-available", driverId)
        
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
const mongoose = require("mongoose")
const ActiveDriver = require("../../../db-models/ActiveDriver")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        const driverData = req.driverData
        const lat = Number(req.body.lat) || NaN
        const lng = Number(req.body.lng) || NaN

        // validate latitude and longitude input
        if (
            (
                !lat ||
                !lng
            ) ||
            (
                lat < -90 ||
                lat > 90 ||
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
        
        const setLocation = async () => {
            await redisClient.sendCommand([
                "GEOADD",
                "active_drivers_location",
                String(lng),
                String(lat),
                driverId
            ])
            
            return driverId
        }
        const setDriverData = async () => {
            await redisClient.sendCommand([
                "SET",
                `active_drivers:${driverId}`,
                JSON.stringify(driverData)
            ])
            
            return driverId
        }

        await Promise.all([setLocation(), setDriverData()])

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
module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const userId = req.userId
        const rideDetails = req.rideDetails
        
        // get active drivers
        const activeDrivers = await redisClient.sendCommand([
            "GEOSEARCH",
            "active_drivers_location",
            "FROMLONLAT",
            String(rideDetails.pickupLocation.lng),
            String(rideDetails.pickupLocation.lat),
            "BYRADIUS",
            "5",
            "km",
            "WITHDIST",
            "ASC",
            "COUNT",
            "10"
        ])
        res.json(activeDrivers)
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
module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const userId = req.userId
        const rideDetails = req.rideDetails
        const vehicleType = String(req.query.vehicleType || "two-wheeler")
        
        let key = ""
        if (vehicleType === "two-wheeler"){
            key = "active_two_wheeler_drivers"
        }
        if (vehicleType === "four-wheeler"){
            key = "active_four_wheeler_drivers"
        }

        // get active drivers
        const activeDrivers = await redisClient.sendCommand([
            "GEOSEARCH",
            key,
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
        console.log(activeDrivers)
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
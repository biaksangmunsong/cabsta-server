module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId

        const getDriverData = async () => {
            const activeDriver = await redisClient.sendCommand([
                "GET",
                `active_drivers:${driverId}`
            ])
            
            if (activeDriver){
                return true
            }
            else {
                return false
            }
        }
        const getDriverLocation = async () => {
            const driverLocation = await redisClient.sendCommand([
                "GEOHASH",
                "active_drivers_location",
                driverId
            ])
            
            if (driverLocation && driverLocation[0]){
                return true
            }
            else {
                return false
            }
        }

        const check = await Promise.all([getDriverData(), getDriverLocation()])
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            active: (check[0] && check[1]) ? true : false
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
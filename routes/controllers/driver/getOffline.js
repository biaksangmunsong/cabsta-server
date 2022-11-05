module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        
        const deleteDriverData = async () => {
            await redisClient.sendCommand([
                "DEL",
                `active_drivers:${driverId}`
            ])

            return driverId
        }
        const deleteLocation = async () => {
            await redisClient.sendCommand([
                "ZREM",
                "active_drivers_location",
                driverId
            ])
        }

        await Promise.all([deleteDriverData(), deleteLocation()])
        
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
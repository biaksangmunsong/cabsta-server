module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        
        const activeDriver = await redisClient.sendCommand([
            "GEOHASH",
            "active_drivers",
            driverId
        ])
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            active: (activeDriver && activeDriver[0]) ? true : false
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
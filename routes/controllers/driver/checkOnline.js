module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        
        const activeTwoWheelerDriver = await redisClient.sendCommand([
            "GEOHASH",
            "active_two_wheeler_drivers",
            driverId
        ])
        const activeFourWheelerDriver = await redisClient.sendCommand([
            "GEOHASH",
            "active_four_wheeler_drivers",
            driverId
        ])
        let active = false
        if ((activeTwoWheelerDriver && activeTwoWheelerDriver[0]) || (activeFourWheelerDriver && activeFourWheelerDriver[0])){
            active = true
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({active})
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
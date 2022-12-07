module.exports = async (req, res, next) => {
    
    try {
        const driverId = req.driverId
        const redisClient = req.redisClient
        const token = String(req.body.token || "")
        
        await redisClient.sendCommand([
            "SET",
            `driver_fcm_token:${driverId}`,
            token
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
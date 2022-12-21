const getDriverOffline = require("../../../lib/getDriverOffline")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId
        const socketIo = req.socketIo
        
        await getDriverOffline(driverId, redisClient)
        
        // send to everyone that driver is unavailable
        socketIo.emit("driver-unavailable", driverId)
        
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
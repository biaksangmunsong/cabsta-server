const validateCoords = require("../../../lib/validateCoords")

module.exports = async (req, res, next) => {
    
    try {
        const coords = req.body.coords
        const driverId = req.driverId
        const redisClient = req.redisClient

        // validate coords
        if (!validateCoords(coords)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }
        
        // update location
        await redisClient.sendCommand([
            "GEOADD",
            "active_drivers",
            "XX",
            String(coords.lng),
            String(coords.lat),
            driverId
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
const checkDriverActive = require("../../../lib/checkDriverActive")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const driverId = req.driverId

        const check = await checkDriverActive(driverId, redisClient)
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(check)
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
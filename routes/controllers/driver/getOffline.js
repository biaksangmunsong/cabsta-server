const ActiveDriver = require("../../../db-models/ActiveDriver")

module.exports = async (req, res, next) => {

    try {
        const driverId = req.driverId
        
        await ActiveDriver.deleteMany({driverId})

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
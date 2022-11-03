const ActiveDriver = require("../../../db-models/ActiveDriver")

module.exports = async (req, res, next) => {

    try {
        const driverId = req.driverId
        
        const activeDriver = await ActiveDriver.findOne({driverId})
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            _id: activeDriver ? activeDriver._id : null
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
const ObjectId = require('mongoose').Types.ObjectId
// const RideRequest = require("../../db-models/RideRequest")

module.exports = async (req, res, next) => {

    try {
        const details = req.rideDetails
        const driver = String(req.body.driver || "")
        const passenger = req.userId
        
        if (!ObjectId.isValid(driver)){
            return next({
                status: 406,
                data: {
                    message: "Invalid Request"
                }
            })
        }

        // check if driver is still available
        const existingRequest = await RideRequest.findOne({driver})
        if (existingRequest){
            return next({
                status: 409,
                data: {
                    message: "Driver is no longer available."
                }
            })
        }

        // create request
        const newRequest = new RideRequest({
            driver,
            passenger,
            details
        })
        await newRequest.save()

        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(rideDetails)
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
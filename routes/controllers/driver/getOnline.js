const mongoose = require("mongoose")
const ActiveDriver = require("../../../db-models/ActiveDriver")

module.exports = async (req, res, next) => {

    try {
        const driverId = req.driverId
        const driverData = req.driverData
        const lat = Number(req.body.lat) || NaN
        const lng = Number(req.body.lng) || NaN

        // validate latitude and longitude input
        if (
            (
                !lat ||
                !lng
            ) ||
            (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            )
        ){
            return next({
                status: 406,
                data: {
                    message: "Invalid input data"
                }
            })
        }

        // check if document already exists
        const existingDoc = await ActiveDriver.findOne({driverId})
        if (existingDoc){
            existingDoc.location = {
                type: "Point",
                coordinates: [lng,lat]
            }
            existingDoc.lastUpdated = Date.now()
            await existingDoc.save()

            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({_id: existingDoc._id})
        }
        else {
            const _id = new mongoose.Types.ObjectId()
            const newActiveDriver = new ActiveDriver({
                _id,
                driverId,
                driverData,
                location: {
                    type: "Point",
                    coordinates: [lng,lat]
                }
            })
            await newActiveDriver.save()

            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({_id})
        }
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
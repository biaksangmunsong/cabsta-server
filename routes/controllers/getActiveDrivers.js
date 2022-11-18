const Driver = require("../../db-models/Driver")
const getAge = require("../../lib/getAge")

module.exports = async (req, res, next) => {
    
    try {
        const redisClient = req.redisClient
        const rideDetails = req.rideDetails
        const vehicleType = String(req.query.vehicleType || "two-wheeler")
        
        let key = ""
        if (vehicleType === "two-wheeler"){
            key = "active_two_wheeler_drivers"
        }
        if (vehicleType === "four-wheeler"){
            key = "active_four_wheeler_drivers"
        }

        // get active drivers
        const activeDrivers = await redisClient.sendCommand([
            "GEOSEARCH",
            key,
            "FROMLONLAT",
            String(rideDetails.pickupLocation.lng),
            String(rideDetails.pickupLocation.lat),
            "BYRADIUS",
            "2000",
            "m",
            "WITHDIST",
            "ASC",
            "COUNT",
            "10"
        ])
        
        const responseData = {
            radius: 3,
            drivers: []
        }
        
        if (activeDrivers.length){
            // get driver data
            const driversData = await Driver.find({
                _id: {
                    $in: activeDrivers.map(ad => ad[0])
                }
            })

            if (driversData.length){
                activeDrivers.forEach(driver => {
                    let item = null
                    const dd = driversData.filter(data => String(data._id) === driver[0])
                    if (dd[0]){
                        const data = dd[0].toJSON()
                        item = {
                            _id: data._id,
                            name: data.name,
                            photo: data.photo,
                            gender: data.gender,
                            phoneNumber: data.phoneNumber,
                            countryCode: data.countryCode,
                            age: getAge(data.dob),
                            vehicle: data.vehicle.model,
                            distance: driver[1]
                        }
                    }
                    if (item){
                        responseData.drivers = [...responseData.drivers, item]
                    }
                })
            }
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(responseData)
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
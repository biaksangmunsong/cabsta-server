const Ride = require("../db-models/Ride")

module.exports = (userId, limit) => {
    
    return new Promise(async (resolve, reject) => {
        try {
            const rides = await Ride.find({
                userId,
                status: "initiated"
            }).sort({acceptedAt: -1}).limit(limit)
            const uncompletedRides = []
            rides.forEach(ride => {
                ride = ride.toJSON()
                uncompletedRides.push({
                    _id: ride._id,
                    acceptedAt: ride.acceptedAt,
                    driver: {
                        name: ride.details.driver.name,
                        photo: ride.details.driver.photo
                    },
                    vehicleType: ride.details.vehicleType
                })
            })
            
            resolve(uncompletedRides)
        }
        catch (err){
            reject(err)
        }
    })

}
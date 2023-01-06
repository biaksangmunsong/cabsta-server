const Ride = require("../db-models/Ride")

module.exports = (driverId, earningsFor) => {

    if (!earningsFor){
        earningsFor = "today"
    }

    if (earningsFor === "today"){
        return new Promise(async (resolve, reject) => {
            try {
                const startOfToday = new Date().setHours(0,0,0,0)
                
                const rides = await Ride.find({
                    driverId,
                    status: "completed",
                    completedAt: {
                        $gte: startOfToday
                    }
                })
                
                let earnings = 0
                rides.forEach(ride => {
                    ride = ride.toJSON()
                    earnings += ride.details.price
                })
                
                resolve({
                    for: earningsFor,
                    earnings
                })
            }
            catch (err){
                reject(err)
            }
        })
    }

}
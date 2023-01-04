const Ride = require("../../db-models/Ride")

module.exports = async (req, res, next) => {
    
    try {
        const userId = req.userId
        const lastItem = Number(req.query.lastItem) || Date.now()
        
        // get rides from database
        const rides = await Ride.find({
            userId,
            acceptedAt: {
                $lt: lastItem
            }
        }).sort({acceptedAt: -1}).limit(5)
        
        // build response data
        const responseData = []
        for (let i = 0; i < rides.length; i++){
            const ride = rides[i].toJSON()
            responseData.push({
                _id: ride._id,
                status: ride.status,
                userId: ride.userId,
                driverId: ride.driverId,
                requestedAt: ride.requestedAt,
                acceptedAt: ride.acceptedAt,
                cancellation: ride.cancellation ? {
                    iat: ride.cancellation.iat,
                    iby: ride.cancellation.iby
                } : undefined,
                completedAt: ride.completedAt,
                details: {
                    ...ride.details,
                    user: {
                        ...ride.details.user,
                        countryCode: undefined,
                        phoneNumber: undefined
                    },
                    driver: {
                        ...ride.details.driver,
                        countryCode: undefined,
                        phoneNumber: undefined
                    }
                }
            })
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
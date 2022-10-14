const axios = require("axios")

module.exports = async (req, res, next) => {
    
    try {
        const pickupLocationLat = Number(req.query.pickupLocationLat) || 0
        const pickupLocationLng = Number(req.query.pickupLocationLng) || 0
        const destinationLat = Number(req.query.destinationLat) || 0
        const destinationLng = Number(req.query.destinationLng) || 0

        // validate pickupLocation and destination
        if (
            pickupLocationLat < -90 ||
            pickupLocationLat > 90 ||
            pickupLocationLng < -180 ||
            pickupLocationLng > 180 ||
            destinationLat < -90 ||
            destinationLat > 90 ||
            destinationLng < -180 ||
            destinationLng > 180
        ){
            return next({
                status: 406,
                data: {
                    message: "Invalid input data"
                }
            })
        }
        
        const distanceMatrixData = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationLat},${destinationLng}&origins=${pickupLocationLat},${pickupLocationLng}&units=metric&key=${process.env.GOOGLE_MAPS_API_KEY}`)
        
        if (distanceMatrixData.status !== 200 || !distanceMatrixData.data){
            return next({
                status: 500,
                data: {
                    message: "Internal Server Error"
                }
            })
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            distanceMatrix: distanceMatrixData.data,
            pricing: JSON.parse(process.env.PRICING),
            note: "Distance and Estimated Time may not always be accurate due to traffic jams or other complications."
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
const axios = require("axios")
const calculatePrice = require("../lib/calculatePrice")

module.exports = async (req, res, next) => {

    try {
        const pickupLocationLat = Number(req.query.pickupLocationLat) || NaN
        const pickupLocationLng = Number(req.query.pickupLocationLng) || NaN
        const destinationLat = Number(req.query.destinationLat) || NaN
        const destinationLng = Number(req.query.destinationLng) || NaN
        
        // validate pickupLocation and destination
        if (
            (
                (!pickupLocationLat && pickupLocationLat !== 0) ||
                (!pickupLocationLng && pickupLocationLng !== 0) ||
                (!destinationLat && destinationLat !== 0) ||
                (!destinationLng && destinationLng !== 0)
            ) ||
            (
                pickupLocationLat < -85 ||
                pickupLocationLat > 85 ||
                pickupLocationLng < -180 ||
                pickupLocationLng > 180 ||
                destinationLat < -85 ||
                destinationLat > 85 ||
                destinationLng < -180 ||
                destinationLng > 180
            )
        ){
            return next({
                status: 406,
                data: {
                    message: "Invalid input data"
                }
            })
        }

        // make sure pickup location and destination are different
        if (
            pickupLocationLat === destinationLat &&
            pickupLocationLng === destinationLng
        ){
            return next({
                status: 406,
                data: {
                    message: "Pickup Location and Destination should not be the same."
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
        if (
            !distanceMatrixData.data.rows ||
            !distanceMatrixData.data.rows[0] ||
            !distanceMatrixData.data.rows[0].elements[0]
        ){
            return next({
                status: 400,
                data: {
                    message: "Something went wrong, please try again."
                }
            })
        }
        
        const pricing = JSON.parse(process.env.PRICING)
        const price = calculatePrice(distanceMatrixData.data.rows[0].elements[0].distance.value, pricing.basePrice, pricing.perKmPrice)
        const distance = distanceMatrixData.data.rows[0].elements[0].distance
        const duration = distanceMatrixData.data.rows[0].elements[0].duration

        // set minimun and maximum distance
        if (distance.value < 50){
            return next({
                status: 406,
                data: {
                    message: "Pickup Location and Destination are too close to each other."
                }
            })
        }
        if (distance.value > pricing.perKmPrice[pricing.perKmPrice.length-1].to){
            return next({
                status: 406,
                data: {
                    message: `Distance between Pickup Location and Destination should not be more than ${Math.floor(pricing.perKmPrice[pricing.perKmPrice.length-1].to/1000)}km.`
                }
            })
        }
        
        req.rideDetails = {
            price,
            distance,
            duration,
            pickupLocation: {
                lat: pickupLocationLat,
                lng: pickupLocationLng
            },
            destination: {
                lat: destinationLat,
                lng: destinationLng
            }
        }
        next()
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
const axios = require("axios")
const calculatePrice = require("../lib/calculatePrice")
const validateRideDetails = require("../lib/validateRideDetails")

module.exports = async (req, res, next) => {

    try {
        const redisClient = req.redisClient
        const pickupLocationLat = Number(req.query.pickupLocationLat) || NaN
        const pickupLocationLng = Number(req.query.pickupLocationLng) || NaN
        const destinationLat = Number(req.query.destinationLat) || NaN
        const destinationLng = Number(req.query.destinationLng) || NaN
        
        const rideDetailsCheck = validateRideDetails(pickupLocationLat, pickupLocationLng, destinationLat, destinationLng)
        if (rideDetailsCheck.status !== 200){
            return next({
                status: rideDetailsCheck.status,
                data: rideDetailsCheck.data
            })
        }
        
        let distanceMatrixData = null
        // look for distance matrix data on redis
        const cacheDistanceMatrixData = await redisClient.sendCommand([
            "GET",
            `distance_matrix_data:destination-${destinationLat},${destinationLng}_origin-${pickupLocationLat},${pickupLocationLng}`
        ])
        if (cacheDistanceMatrixData){
            // if distance matrix data is found in redis, use that
            distanceMatrixData = JSON.parse(cacheDistanceMatrixData)
        }
        else {
            // if distance matrix data is not found in redis make a request to google maps
            const res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationLat},${destinationLng}&origins=${pickupLocationLat},${pickupLocationLng}&units=metric&key=${process.env.GOOGLE_MAPS_API_KEY}`)

            if (res.status !== 200 || !res.data){
                return next({
                    status: 500,
                    data: {
                        message: "Internal Server Error"
                    }
                })
            }
            
            distanceMatrixData = res.data

            // save data to redis
            await redisClient.sendCommand([
                "SETEX",
                `distance_matrix_data:destination-${destinationLat},${destinationLng}_origin-${pickupLocationLat},${pickupLocationLng}`,
                "86400",
                JSON.stringify(res.data)
            ])
        }
        
        if (
            !distanceMatrixData.rows ||
            !distanceMatrixData.rows[0] ||
            !distanceMatrixData.rows[0].elements[0]
        ){
            return next({
                status: 400,
                data: {
                    message: "Invalid input data"
                }
            })
        }
        
        const pricing = JSON.parse(process.env.PRICING)
        const price = calculatePrice(distanceMatrixData.rows[0].elements[0].distance.value, pricing.basePrice, pricing.perKmPrice)
        const distance = distanceMatrixData.rows[0].elements[0].distance
        const duration = distanceMatrixData.rows[0].elements[0].duration

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
                lng: pickupLocationLng,
                address: distanceMatrixData.origin_addresses[0]
            },
            destination: {
                lat: destinationLat,
                lng: destinationLng,
                address: distanceMatrixData.destination_addresses[0]
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
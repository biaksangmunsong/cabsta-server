const ObjectId = require('mongoose').Types.ObjectId
const User = require("../../db-models/User")
const Driver = require("../../db-models/Driver")
const { phone } = require("phone")
const getAge = require("../../lib/getAge")
const { getMessaging } = require("firebase-admin/messaging")
const validateName = require("../../lib/validateName")

const getUserDetails = async userId => {
    const userDoc = await User.findOne({_id: userId})
    return userDoc
}

const getDriverDetails = async driverId => {
    const driverDoc = await Driver.findOne({_id: driverId})
    return driverDoc
}

module.exports = async (req, res, next) => {
    
    try {
        const socketIo = req.socketIo
        const redisClient = req.redisClient
        const userId = req.userId
        const rideDetails = req.rideDetails
        const usersName = String(req.body.name || "")
        const usersPhoneNumber = phone(req.body.phoneNumber || "", {country: "IN"})
        
        // validate user's name and user's phone number
        const nameCheck = validateName(usersName)
        if (nameCheck.error){
            return next({
                status: 406,
                data: {
                    message: nameCheck.error.message
                }
            })
        }
        if (!usersPhoneNumber.isValid){
            return next({
                status: 406,
                data: {
                    code: "invalid-phone-number",
                    message: "Invalid phone number"
                }
            })
        }
        
        const driverId = String(req.body.driverId || "")
        const vehicleType = String(req.body.vehicleType || "two-wheeler")

        // validate driverId
        if (!ObjectId.isValid(driverId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid input"
                }
            })
        }

        // check if driver is available
        const requestId = `ride_request:${driverId}`
        const driverRequest = await redisClient.sendCommand([
            "GET",
            requestId
        ])
        if (driverRequest){
            return next({
                status: 409,
                data: {
                    message: "Driver no longer available"
                }
            })
        }
        let driverAvailable = true
        if (vehicleType === "two-wheeler"){
            const activeDriver = await redisClient.sendCommand([
                "GEOHASH",
                "active_two_wheeler_drivers",
                driverId
            ])
            if (!activeDriver || !activeDriver[0]){
                driverAvailable = false
            }
        }
        else if (vehicleType === "four-wheeler"){
            const activeDriver = await redisClient.sendCommand([
                "GEOHASH",
                "active_four_wheeler_drivers",
                driverId
            ])
            if (!activeDriver || !activeDriver[0]){
                driverAvailable = false
            }
        }
        if (!driverAvailable){
            return next({
                status: 409,
                data: {
                    message: "Driver no longer available"
                }
            })
        }
        
        // get user and driver details
        const details = await Promise.all([getUserDetails(userId), getDriverDetails(driverId)])
        if (!details[0]){
            return next({
                status: 404,
                data: {
                    message: "User not found"
                }
            })
        }
        if (!details[1]){
            return next({
                status: 404,
                data: {
                    message: "Driver not found"
                }
            })
        }
        const userDetails = details[0].toJSON()
        const driverDetails = details[1].toJSON()
        
        const rideRequestDetails = {
            ...rideDetails,
            iat: Date.now(),
            user: {
                _id: userDetails._id,
                name: usersName,
                photo: userDetails.profilePhoto,
                phoneNumber: usersPhoneNumber.phoneNumber,
                countryCode: usersPhoneNumber.countryCode
            },
            driver: {
                _id: driverDetails._id,
                name: driverDetails.name,
                photo: driverDetails.photo,
                gender: driverDetails.gender,
                age: getAge(driverDetails.dob),
                vehicle: driverDetails.vehicle,
                phoneNumber: driverDetails.phoneNumber,
                countryCode: driverDetails.countryCode
            }
        }
        
        // create request and write to redis
        await redisClient.sendCommand([
            "SETEX",
            requestId,
            process.env.RIDE_REQUEST_TIMEOUT,
            JSON.stringify(rideRequestDetails)
        ])
        
        // send to everyone that driver is unavailable
        socketIo.emit("driver-unavailable", driverId)

        // send notification to driver
        const driverFcmToken = await redisClient.sendCommand([
            "GET",
            `driver_fcm_token:${driverId}`
        ])
        if (driverFcmToken){
            try {
                const fcmMessage = {
                    token: driverFcmToken,
                    notification: {
                        title: "Ride Request",
                        body: `You've got a ride request, please respond within ${process.env.RIDE_REQUEST_TIMEOUT} seconds.\n\nPickup Address: ${rideRequestDetails.pickupLocation.address}\n\nDistance: ${rideRequestDetails.distance.text}`
                    },
                    data: {
                        for: "ride-request",
                        usersPhoto: rideRequestDetails.user.photo ? rideRequestDetails.user.photo.thumbnail_url : "",
                        serverMillis: String(Date.now())
                    },
                    android: {
                        ttl: 0,
                        priority: "high",
                        notification: {
                            sound: "telephone_ring.mp3",
                            channel_id: "ride-request",
                            tag: "ride-request"
                        }
                    }
                }
                await getMessaging().send(fcmMessage)
            }
            catch {}
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            driverId,
            timeout: Number(process.env.RIDE_REQUEST_TIMEOUT)
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
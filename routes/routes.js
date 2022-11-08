const express = require("express")
const router = express.Router()

const verifyUser = require("../middlewares/verifyUser")
const verifyDriver = require("../middlewares/verifyDriver")
const withRideDetails = require("../middlewares/withRideDetails")

const sendSigninOtp = require("./controllers/sendSigninOtp")
const signin = require("./controllers/signin")
const getUserData = require("./controllers/getUserData")
const editProfile = require("./controllers/editProfile")
const addSavedPlace = require("./controllers/addSavedPlace")
const editSavedPlace = require("./controllers/editSavedPlace")
const deleteSavedPlace = require("./controllers/deleteSavedPlace")
const getSavedPlace = require("./controllers/getSavedPlace")
const getSavedPlaces = require("./controllers/getSavedPlaces")
const sendPhoneNumberChangeOtp = require("./controllers/sendPhoneNumberChangeOtp")
const changePhoneNumber = require("./controllers/changePhoneNumber")
const getVehicleSelectorPageData = require("./controllers/getVehicleSelectorPageData")
const getPricingData = require("./controllers/getPricingData")
const requestARide = require("./controllers/requestARide")

const driverSignin = require("./controllers/driver/signin")
const getOnline = require("./controllers/driver/getOnline")
const getOffline = require("./controllers/driver/getOffline")
const checkOnline = require("./controllers/driver/checkOnline")

// const SavedPlace = require("../db-models/SavedPlace")
const Driver = require("../db-models/Driver")
const User = require("../db-models/User")
const { getMessaging } = require("firebase-admin/messaging")

router.get("/", async (req, res, next) => {
    res.send("Hello from Cabsta Api")
})


router.get("/add-driver", async (req, res, next) => {
    try {
        const newDriver = new Driver({
            phoneNumber: "+917085259566",
            countryCode: "+91",
            name: "Biaksang Munsong"
        })
        await newDriver.save()
        res.send("done")

        // generate jwt
        // const authToken = jwt.sign({
        //     userId: ,
        //     phoneNumber: "+917085259566",
        //     iat: now
        // }, process.env.JWT_SECRET)

        // // send response
        // res
        // .status(200)
        // .set("Cache-Control", "no-store")
        // .json({authToken})
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/update-active-driver", async (req, res, next) => {
    try {
        await ActiveDriver.updateOne({_id: req.query._id}, {
            lastUpdated: new Date
        })
        
        res.send("done")
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/test", async (req, res, next) => {
    
    try {
        let start = Date.now()
        const users = await User.find({
            _id: {
                $in: [
                    "6332129b0d01b6f8b929bbfc",
                    "633213770d01b6f8b929bc17",
                    "63362e8c69adcf1811e61105",
                    "6365f62d6d6736c0d65b64ff",
                    "6365f6436d6736c0d65b650d"
                ]
            }
        })
        console.log(Date.now()-start)
        res
        .status(200)
        .send(String(users.length))
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }



    // try {
    //     const places = await SavedPlace.find({
    //         location: {
    //             $near: {
    //                 $geometry: {
    //                     type: "Point",
    //                     coordinates: [
    //                         93.670855, // longitude
    //                         24.333492 // latitude
    //                     ]
    //                 },
    //                 $minDistance: 10,
    //                 $maxDistance: 3000
    //             }
    //         }
    //     }).limit(2)
    //     res.json(places)
    // }
    // catch (err){
    //     console.log(err)
    //     next({
    //         data: {
    //             message: "Internal server error"
    //         }
    //     })
    // }
})
router.get("/send-test-notification", async (req, res, next) => {
    try {
        const fcmMessage = {
            token: "cC_lxdqJSWe9nrXmmwAI3R:APA91bFVvsKdB-_orInlEg3GHc4ehFEEyCR7SRJx7U2fEt163d2SKKA9iy-Q6giKliShlfYunibhk4tWvsNK5zuI_5sGZ8wV839kc2Hktq7G-rjcCMYv8dbG6tV9jJqeDAWZIZWXxYXs",
            notification: {
                title: "Ride Request",
                body: "You've got a ride request, please renpond within 30 seconds."
            },
            data: {
                id: "1234"
            },
            android: {
                ttl: 0,
                priority: "high",
                notification: {
                    sound: "default",
                    channel_id: "ride-request",
                    tag: "ride-request"
                }
            }
        }
        await getMessaging().send(fcmMessage)

        res.send("done")
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/test-redis", async (req, res, next) => {
    try {
        redisClient = req.redisClient


        const list = await redisClient.sendCommand([
            "KEYS",
            "*otps:signn:+70*"
        ])
        console.log(list.length)



        // await redisClient.geoAdd("active_drivers", {
        //     longitude: 93.6967933,
        //     latitude: 24.339645,
        //     member: "driver1"
        // })


        const results = await redisClient.sendCommand([
            "GEOSEARCH",
            "active_drivers_location",
            "FROMLONLAT",
            "93.690117",
            "24.313994",
            "BYRADIUS",
            "20",
            "km",
            "WITHDIST",
            "ASC",
            "COUNT",
            "10"
        ])
        console.log(results)
        return res.json(results)


        // await redisClient.sendCommand([
        //     "GEOADD",
        //     "active_drivers",
        //     "93.699744",
        //     "24.345665",
        //     "driver3"
        // ])

        // const setDriver = async id => {
        //     await redisClient.sendCommand([
        //         "SETEX",
        //         `active_drivers:data:${id}`,
        //         "10",
        //         JSON.stringify({
        //             name: "Name",
        //             age: 22,
        //             gender: "male",
        //             vehicleType: "two-wheeler"
        //         })
        //     ])

        //     return id
        // }

        const setLocation = async id => {
            await redisClient.geoAdd("active_drivers_location", {
                longitude: 93.6967933,
                latitude: 24.339645,
                member: id
            })

            return id
        }

        const ids = ["driver1", "driver2", "driver3", "driver4", "driver5", "driver6", "driver7", "driver8", "driver9", "driver10", "driver11", "driver12", "driver13", "driver14", "driver15"]
        await Promise.all(ids.map(id => setLocation(id)))

        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver1",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver2",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver3",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver4",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        




        res.send("ok")
        // const value = await redisClient.get("hello")
        // res.send(value || "null")
    }
    catch (err){
        console.log(err.message)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})


router.post("/send-signin-otp", sendSigninOtp)
router.post("/signin", signin)
router.get("/get-pricing-data", getPricingData)
router.get("/get-user-data", verifyUser, getUserData)
router.post("/edit-profile", verifyUser, editProfile)
router.post("/add-saved-place", verifyUser, addSavedPlace)
router.post("/edit-saved-place", verifyUser, editSavedPlace)
router.delete("/delete-saved-place", verifyUser, deleteSavedPlace)
router.get("/get-saved-place", verifyUser, getSavedPlace)
router.get("/get-saved-places", verifyUser, getSavedPlaces)
router.post("/send-phone-number-change-otp", verifyUser, sendPhoneNumberChangeOtp)
router.post("/change-phone-number", verifyUser, changePhoneNumber)
router.post("/change-phone-number", verifyUser, changePhoneNumber)
router.get("/get-vehicle-selector-page-data", verifyUser, withRideDetails, getVehicleSelectorPageData)
router.post("/request-a-ride", verifyUser, withRideDetails, requestARide)

router.post("/driver/signin", driverSignin)
router.post("/driver/get-online", verifyDriver, getOnline)
router.delete("/driver/get-offline", verifyDriver, getOffline)
router.get("/driver/check-online", verifyDriver, checkOnline)

module.exports = router
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

// const SavedPlace = require("../db-models/SavedPlace")
const Driver = require("../db-models/Driver")
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
        const places = await SavedPlace.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            93.670855, // longitude
                            24.333492 // latitude
                        ]
                    },
                    $minDistance: 10,
                    $maxDistance: 3000
                }
            }
        }).limit(2)
        res.json(places)
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

module.exports = router
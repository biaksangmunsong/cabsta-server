const express = require("express")
const router = express.Router()
const verifyUser = require("../middlewares/verifyUser")
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

// const SavedPlace = require("../db-models/SavedPlace")
const ActiveDriver = require("../db-models/ActiveDriver")

router.get("/", async (req, res, next) => {
    res.send("Hello from Cabsta Api")
})
router.get("/add-active-driver", async (req, res, next) => {
    try {
        const newActiveDriver = new ActiveDriver({
            userId: "63362e8c69adcf1811e61105",
            userData: {
                name: "Biaksang Munsong",
                age: 22,
                gender: "Male"
            },
            location: {
                type: "Point",
                coordinates: [93.695020,24.340019]
            },
            lastUpdated: new Date
        })
        await newActiveDriver.save()

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
router.post("/v1/send-signin-otp", sendSigninOtp)
router.post("/v1/signin", signin)
router.get("/v1/get-user-data", verifyUser, getUserData)
router.post("/v1/edit-profile", verifyUser, editProfile)
router.post("/v1/add-saved-place", verifyUser, addSavedPlace)
router.post("/v1/edit-saved-place", verifyUser, editSavedPlace)
router.delete("/v1/delete-saved-place", verifyUser, deleteSavedPlace)
router.get("/v1/get-saved-place", verifyUser, getSavedPlace)
router.get("/v1/get-saved-places", verifyUser, getSavedPlaces)
router.post("/v1/send-phone-number-change-otp", verifyUser, sendPhoneNumberChangeOtp)
router.post("/v1/change-phone-number", verifyUser, changePhoneNumber)
router.post("/v1/change-phone-number", verifyUser, changePhoneNumber)
router.get("/v1/get-vehicle-selector-page-data", verifyUser, getVehicleSelectorPageData)

module.exports = router

const express = require("express")
const router = express.Router()
const verifyUser = require("../middlewares/verifyUser")
const sendSigninOtp = require("./controllers/sendSigninOtp")
const signin = require("./controllers/signin")
const getUserData = require("./controllers/getUserData")
const editProfile = require("./controllers/editProfile")
const addSavedPlace = require("./controllers/addSavedPlace")
const editSavedPlace = require("./controllers/editSavedPlace")
const getSavedPlace = require("./controllers/getSavedPlace")
const getSavedPlaces = require("./controllers/getSavedPlaces")
const sendPhoneNumberChangeOtp = require("./controllers/sendPhoneNumberChangeOtp")
const changePhoneNumber = require("./controllers/changePhoneNumber")

const SavedPlace = require("../db-models/SavedPlace")

router.get("/", async (req, res, next) => {
    res.redirect("https://cabsta-dev.netlify.app/")
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
router.post("/api/v1/send-signin-otp", sendSigninOtp)
router.post("/api/v1/signin", signin)
router.get("/api/v1/get-user-data", verifyUser, getUserData)
router.post("/api/v1/edit-profile", verifyUser, editProfile)
router.post("/api/v1/add-saved-place", verifyUser, addSavedPlace)
router.post("/api/v1/edit-saved-place", verifyUser, editSavedPlace)
router.get("/api/v1/get-saved-place", verifyUser, getSavedPlace)
router.get("/api/v1/get-saved-places", verifyUser, getSavedPlaces)
router.post("/api/v1/send-phone-number-change-otp", verifyUser, sendPhoneNumberChangeOtp)
router.post("/api/v1/change-phone-number", verifyUser, changePhoneNumber)

module.exports = router

const express = require("express")
const router = express.Router()
const verifyUser = require("../middlewares/verifyUser")
const sendSigninOtp = require("./controllers/sendSigninOtp")
const signin = require("./controllers/signin")
const getUserData = require("./controllers/getUserData")
const editProfile = require("./controllers/editProfile")
const addSavedPlace = require("./controllers/addSavedPlace")
const editSavedPlace = require("./controllers/editSavedPlace")

const Test = require("../db-models/Test")

router.get("/", async (req, res, next) => {
    res.redirect("https://cabsta-dev.netlify.app/")
})
router.get("/test", async (req, res, next) => {
    setTimeout(async () => {
        try {
            const newTest = new Test({
                message: "This document is created after 25 minutes"
            })
            await newTest.save()
        }
        catch (err){
            console.log(err)
        }
    }, 1500000)
    res.send("wait 25 minutes")
})
router.post("/api/v1/send-signin-otp", sendSigninOtp)
router.post("/api/v1/signin", signin)
router.get("/api/v1/get-user-data", verifyUser, getUserData)
router.post("/api/v1/edit-profile", verifyUser, editProfile)
router.post("/api/v1/add-saved-place", verifyUser, addSavedPlace)
router.post("/api/v1/edit-saved-place", verifyUser, editSavedPlace)

module.exports = router

const express = require("express")
const router = express.Router()
const verifyUser = require("../middlewares/verifyUser")
const sendSigninOtp = require("./controllers/sendSigninOtp")
const signin = require("./controllers/signin")
const getUserData = require("./controllers/getUserData")
const editProfile = require("./controllers/editProfile")

const Test = require("../db-models/Test")

router.get("/", async (req, res, next) => {
    res.redirect("https://cabsta-dev.netlify.app/")
})
router.get("/test", async (req, res, next) => {
    setTimeout(async () => {
        try {
            const newTest = new Test({})
            await newTest.save()
        }
        catch (err){
            console.log(err)
        }
    }, 3600000)
    res.send("wait 1 hour")
})
router.post("/api/v1/send-signin-otp", sendSigninOtp)
router.post("/api/v1/signin", signin)
router.get("/api/v1/get-user-data", verifyUser, getUserData)
router.post("/api/v1/edit-profile", verifyUser, editProfile)

module.exports = router
const Otp = require("../../db-models/Otp")
const User = require("../../db-models/User")
const { phone } = require("phone")
const bcrypt = require("bcryptjs")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const newPhoneNumber = phone(req.body.newPhoneNumber || "", {country: "IN"})

        // check if new phone number is valid
        if (!newPhoneNumber.isValid){
            return next({
                status: 406,
                data: {
                    code: "invalid-phone-number",
                    message: "Invalid phone number"
                }
            })
        }

        // check if new phone number is already registered
        const existingUser = await User.findOne({phoneNumber: newPhoneNumber.phoneNumber})
        if (existingUser){
            return next({
                status: 409,
                data: {
                    message: "An user with the same phone number already exists"
                }
            })
        }
        
        // get current phone number
        const user = await User.findOne({_id: userId})
        if (!user){
            return next({
                status: 404,
                data: {
                    message:"User not found"
                }
            })
        }

        // prevent code to be sent more than once in 10 seconds
        const otpDocs = await Otp.find({phoneNumber: user.phoneNumber})
        if (otpDocs.length > 0){
            if (otpDocs.length >= 3){
                return next({
                    status: 400,
                    data: {
                        code: "otp-temporarily-not-allowed",
                        message: "Cannot send otp to your phone number right now (reason: too many attempts), please try again later."
                    }
                })
            }
            else {
                let cannotSendOtpForNow = false
                for (let i = 0; i < otpDocs.length; i++){
                    const otpDoc = otpDocs[i]
                    if (otpDoc.for === "phone-number-change" && Date.now()-otpDoc.lastSent < 10000){
                        cannotSendOtpForNow = true
                        break
                    }
                }
                if (cannotSendOtpForNow){
                    return next({
                        status: 400,
                        data: {
                            code: "otp-temporarily-not-allowed",
                            message: "Otp already sent"
                        }
                    })
                }
            }
        }

        // send otp to user's current phone number
        const otpId = `${Math.floor(Math.random()*10)}-${Date.now()}`
        const otp = "1234"
        const salt = await bcrypt.genSalt(10)
        const hashedOtp = await bcrypt.hash(otp, salt)
        const newOtp = new Otp({
            id: otpId,
            for: "phone-number-change",
            otp: hashedOtp,
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            data: {
                newPhoneNumber: newPhoneNumber.phoneNumber
            }
        })
        await newOtp.save()

        // send response
        res
        .status(200)
        .setHeader("Cache-Control", "no-store")
        .json({otpId})
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
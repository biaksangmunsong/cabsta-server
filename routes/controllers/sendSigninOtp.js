const { phone } = require("phone")
const bcrypt = require("bcryptjs")
const Otp = require("../../db-models/Otp")

module.exports = async (req, res, next) => {

    try {
        // check if phone number is valid
        const phoneNumber = phone(req.body.phoneNumber || "", {country: "IN"})
        if (!phoneNumber.isValid){
            return next({
                status: 406,
                data: {
                    code: "invalid-phone-number",
                    message: "Invalid phone number"
                }
            })
        }

        // prevent code to be sent more than once in 10 seconds
        const otpDocs = await Otp.find({phoneNumber: phoneNumber.phoneNumber})
        if (otpDocs.length > 0){
            if (otpDocs.length >= 3){
                return next({
                    status: 400,
                    data: {
                        code: "otp-temporarily-not-allowed",
                        message: "Cannot send otp to this phone number right now (reason: too many attempts), please try again later."
                    }
                })
            }
            else {
                let cannotSendOtpForNow = false
                for (let i = 0; i < otpDocs.length; i++){
                    const otpDoc = otpDocs[i]
                    if (otpDoc.for === "signin" && Date.now()-otpDoc.lastSent < 10000){
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

        // send otp
        setTimeout(async () => {
            // simulate sending otp with timeout
            // create otp doc
            const otpId = `${Math.floor(Math.random()*10)}-${Date.now()}`
            const otp = "1234"
            const salt = await bcrypt.genSalt(10)
            const hashedOtp = await bcrypt.hash(otp, salt)
            const newOtp = new Otp({
                id: otpId,
                for: "signin",
                otp: hashedOtp,
                phoneNumber: phoneNumber.phoneNumber,
                countryCode: phoneNumber.countryCode
            })
            await newOtp.save()
            
            // send response
            res
            .status(200)
            .setHeader("Cache-Control", "no-store")
            .json({otpId})
        }, 1500)
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
const User = require("../../db-models/User")
const { phone } = require("phone")
const bcrypt = require("bcryptjs")
const axios = require("axios")
const genOtp = require("../../lib/genOtp")

module.exports = async (req, res, next) => {

    try {
        const redisClient = req.redisClient
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
                    message: "An user with the same phone number already exists, if this is your phone number, consider signing in instead."
                }
            })
        }

        // prevent code to be sent more than once in 10 seconds
        let otpDoc = await redisClient.sendCommand([
            "GET",
            `otps:phone_number_change:${newPhoneNumber.phoneNumber}`
        ])
        if (otpDoc){
            otpDoc = JSON.parse(otpDoc)
            if (Date.now()-otpDoc.iat < 10000){
                return next({
                    status: 400,
                    data: {
                        code: "otp-temporarily-not-allowed",
                        message: "Otp already sent."
                    }
                })
            }
        }

        // send otp to new phone number
        const otp = genOtp(4)
        const salt = await bcrypt.genSalt(10)
        const hashedOtp = await bcrypt.hash(otp, salt)
        const newOtp = {
            otp: hashedOtp,
            phoneNumber: newPhoneNumber.phoneNumber,
            countryCode: newPhoneNumber.countryCode,
            iat: Date.now()
        }
        await redisClient.sendCommand([
            "SETEX",
            `otps:phone_number_change:${newPhoneNumber.phoneNumber}`,
            "300",
            JSON.stringify(newOtp)
        ])

        // send otp
        const otpRequestUrl = encodeURI(`https://api.textlocal.in/send?apiKey=${process.env.TEXTLOCAL_API_KEY}&sender=CABSTA&numbers=${newPhoneNumber.phoneNumber}&message=?apiKey=NGE3NTcwNzc3NDRlNDQzMDQ5NDQ3MDQ4NWE3NDMxNjg&sender=CABSTA&message=${otp} is your otp for changing your Cabsta phone number, valid for 5 minutes.\n\nPowered by Siksakol Transportation Services Private Limited.`)
        await axios.get(otpRequestUrl)
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            phoneNumber: newPhoneNumber.phoneNumber,
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
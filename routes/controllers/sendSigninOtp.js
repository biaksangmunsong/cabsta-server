const { phone } = require("phone")
const bcrypt = require("bcryptjs")
const axios = require("axios")
const genOtp = require("../../lib/genOtp")

module.exports = async (req, res, next) => {

    try {
        const redisClient = req.redisClient
        
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
        let otpDoc = await redisClient.sendCommand([
            "GET",
            `otps:signin:${phoneNumber.phoneNumber}`
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
        
        // create otp doc
        const otp = genOtp(4)
        const salt = await bcrypt.genSalt(10)
        const hashedOtp = await bcrypt.hash(otp, salt)
        const newOtp = {
            otp: hashedOtp,
            phoneNumber: phoneNumber.phoneNumber,
            countryCode: phoneNumber.countryCode,
            iat: Date.now()
        }
        await redisClient.sendCommand([
            "SETEX",
            `otps:signin:${phoneNumber.phoneNumber}`,
            "300",
            JSON.stringify(newOtp)
        ])
        
        // send otp
        const otpRequestUrl = encodeURI(`https://api.textlocal.in/send?apiKey=${process.env.TEXTLOCAL_API_KEY}&sender=CABSTA&numbers=${phoneNumber.phoneNumber}&message=?apiKey=NGE3NTcwNzc3NDRlNDQzMDQ5NDQ3MDQ4NWE3NDMxNjg&sender=CABSTA&message=${otp} is your signin otp for Cabsta, valid for 5 minutes.\n\nPowered by Siksakol Transportation Services Private Limited.`)
        await axios.get(otpRequestUrl)
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            phoneNumber: phoneNumber.phoneNumber,
            countryCode: phoneNumber.countryCode
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
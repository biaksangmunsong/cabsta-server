const { phone } = require("phone")
const bcrypt = require("bcryptjs")

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
        const otp = "1234"
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
            "60",
            JSON.stringify(newOtp)
        ])
        
        // send otp
        setTimeout(async () => {
            // simulate sending otp with timeout
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                phoneNumber: phoneNumber.phoneNumber,
                countryCode: phoneNumber.countryCode
            })
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
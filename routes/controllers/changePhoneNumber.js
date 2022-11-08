const User = require("../../db-models/User")
const { phone } = require("phone")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {

    try {
        const redisClient = req.redisClient
        const userId = req.userId
        const otp = String(req.body.otp || "")

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
        
        // get otp doc from redis
        let otpDoc = await redisClient.sendCommand([
            "GET",
            `otps:phone_number_change:${phoneNumber.phoneNumber}`
        ])
        if (!otpDoc){
            return next({
                status: 403,
                data: {
                    message: "Otp expired"
                }
            })
        }
        otpDoc = JSON.parse(otpDoc)
        
        // check if a user exist with the new phone number
        const userWithSamePhoneNumber = await User.findOne({phoneNumber: phoneNumber.phoneNumber})
        if (userWithSamePhoneNumber){
            return next({
                status: 409,
                data: {
                    message: `An user with the same phone number already exists, if this is your phone number, consider signing in instead.`
                }
            })
        }

        // validate otp
        const otpIsValid = await bcrypt.compare(otp, otpDoc.otp)
        if (!otpIsValid){
            return next({
                status: 403,
                data: {
                    message: "Invalid Otp"
                }
            })
        }

        // update phone number
        const user = await User.findOne({_id: userId})
        if (!user){
            return next({
                status: 404,
                data: {
                    message: "User not found"
                }
            })
        }

        const now = Date.now()

        user.phoneNumber = phoneNumber.phoneNumber
        user.countryCode = phoneNumber.countryCode
        user.jwtValidFrom = now

        await user.save()

        // generate new jwt
        const authToken = jwt.sign({
            userId: String(user._id),
            phoneNumber: user.phoneNumber,
            iat: now
        }, process.env.JWT_SECRET)

        try {
            // delete otp doc from redis
            await redisClient.sendCommand([
                "DEL",
                `otps:phone_number_change:${phoneNumber.phoneNumber}`
            ])

            // save jwtValidFrom to redis
            await redisClient.sendCommand([
                "SETEX",
                `users:jwt_valid_from:${String(user._id)}`,
                "604800",
                String(now)
            ])
            
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                phoneNumber: phoneNumber.phoneNumber,
                countryCode: phoneNumber.countryCode,
                authToken
            })
        }
        catch {
            // send response anyway
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                phoneNumber: phoneNumber.phoneNumber,
                countryCode: phoneNumber.countryCode,
                authToken
            })
        }
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
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { phone } = require("phone")
const User = require("../../db-models/User")

module.exports = async (req, res, next) => {

    try {
        const redisClient = req.redisClient
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
            `otps:signin:${phoneNumber.phoneNumber}`
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
        
        // allow opt attempt only once every 2 seconds
        const attemptId = `signin_attempt:${phoneNumber.phoneNumber}`
        const otpAttempt = await redisClient.sendCommand([
            "GET",
            attemptId
        ])
        await redisClient.sendCommand([
            "SETEX",
            attemptId,
            "2",
            JSON.stringify(otp)
        ])
        if (otpAttempt){
            return next({
                status: 429,
                data: {
                    message: "Please wait 2 seconds and try again."
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
        
        // check if user already exists
        const user = await User.findOne({phoneNumber: otpDoc.phoneNumber})
        const now = Date.now()
        if (!user){
            // create new user
            const newUser = new User({
                _id: new mongoose.Types.ObjectId().toHexString(),
                phoneNumber: otpDoc.phoneNumber,
                countryCode: otpDoc.countryCode,
                jwtValidFrom: now
            })
            await newUser.save()
            
            // generate jwt
            const authToken = jwt.sign({
                userId: String(newUser._id),
                phoneNumber: otpDoc.phoneNumber,
                iat: now
            }, process.env.JWT_SECRET)
            
            try {
                // delete otp doc from redis
                await redisClient.sendCommand([
                    "DEL",
                    `otps:signin:${phoneNumber.phoneNumber}`
                ])
                
                // save jwtValidFrom to redis
                await redisClient.sendCommand([
                    "SETEX",
                    `users:jwt_valid_from:${String(newUser._id)}`,
                    "604800",
                    String(now)
                ])
                
                // send response
                res
                .status(200)
                .set("Cache-Control", "no-store")
                .json({
                    phoneNumber: otpDoc.phoneNumber,
                    countryCode: otpDoc.countryCode,
                    authToken
                })
            }
            catch {
                // send response anyway
                res
                .status(200)
                .set("Cache-Control", "no-store")
                .json({
                    phoneNumber: otpDoc.phoneNumber,
                    countryCode: otpDoc.countryCode,
                    authToken
                })
            }
        }
        else {
            // generate jwt
            const authToken = jwt.sign({
                userId: String(user._id),
                phoneNumber: otpDoc.phoneNumber,
                iat: now
            }, process.env.JWT_SECRET)

            try {
                // delete otp doc from redis
                await redisClient.sendCommand([
                    "DEL",
                    `otps:signin:${phoneNumber.phoneNumber}`
                ])
                
                // send response
                res
                .status(200)
                .set("Cache-Control", "no-store")
                .json({
                    phoneNumber: otpDoc.phoneNumber,
                    countryCode: otpDoc.countryCode,
                    name: user.name,
                    profilePhoto: user.profilePhoto,
                    authToken
                })
            }
            catch {
                // send response anyway
                res
                .status(200)
                .set("Cache-Control", "no-store")
                .json({
                    phoneNumber: otpDoc.phoneNumber,
                    countryCode: otpDoc.countryCode,
                    name: user.name,
                    profilePhoto: user.profilePhoto,
                    authToken
                })
            }
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
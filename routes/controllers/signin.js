const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Otp = require("../../db-models/Otp")
const User = require("../../db-models/User")

module.exports = async (req, res, next) => {

    try {
        const otpId = String(req.body.otpId || "")
        const otp = String(req.body.otp || "")
        
        // get otp doc from database
        const otpDocRaw = await Otp.findOne({id: otpId})
        if (!otpDocRaw){
            return next({
                status: 403,
                data: {
                    message: "Otp invalid or expired"
                }
            })
        }
        const otpDoc = otpDocRaw.toJSON()
        
        // validate otp
        const otpIsValid = await bcrypt.compare(otp, otpDoc.otp)
        if (!otpIsValid){
            return next({
                status: 403,
                data: {
                    message: "Invalid confirmation code"
                }
            })
        }
        
        // check if user already exists
        const user = await User.findOne({phoneNumber: otpDoc.phoneNumber})
        if (!user){
            // create new user
            const newUser = new User({
                _id: new mongoose.Types.ObjectId().toHexString(),
                phoneNumber: otpDoc.phoneNumber,
                countryCode: otpDoc.countryCode
            })
            await newUser.save()
            
            // generate jwt
            const authToken = jwt.sign({
                userId: newUser._id,
                phoneNumber: otpDoc.phoneNumber
            }, process.env.JWT_SECRET)

            try {
                // delete otp doc
                await otpDocRaw.delete()
                
                // send response
                res
                .status(200)
                .setHeader("Cache-Control", "no-store")
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
                .setHeader("Cache-Control", "no-store")
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
                userId: user._id,
                phoneNumber: otpDoc.phoneNumber
            }, process.env.JWT_SECRET)

            try {
                // delete otp doc
                await otpDocRaw.delete()

                // send response
                res
                .status(200)
                .setHeader("Cache-Control", "no-store")
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
                .setHeader("Cache-Control", "no-store")
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
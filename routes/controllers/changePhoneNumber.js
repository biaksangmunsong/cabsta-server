const User = require("../../db-models/User")
const Otp = require("../../db-models/Otp")
const { phone } = require("phone")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const otp = String(req.body.otp || "")
        const otpId = String(req.body.otpId || "")

        // get otp doc from database
        const otpDocRaw = await Otp.findOne({id: otpId})
        if (!otpDocRaw || otpDocRaw.for !== "phone-number-change"){
            return next({
                status: 403,
                data: {
                    message: "Otp invalid or expired"
                }
            })
        }
        const otpDoc = otpDocRaw.toJSON()
        
        // validate new phone number
        const newPhoneNumber = phone(otpDoc.phoneNumber || "", {country: "IN"})
        if (!newPhoneNumber.isValid){
            return next({
                status: 406,
                data: {
                    message: "Invalid phone number"
                }
            })
        }

        // check if a user exist with the new phone number
        const userWithSamePhoneNumber = await User.findOne({phoneNumber: newPhoneNumber.phoneNumber})
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

        user.phoneNumber = newPhoneNumber.phoneNumber
        user.countryCode = newPhoneNumber.countryCode
        user.jwtValidFrom = now

        await user.save()

        // generate new jwt
        const authToken = jwt.sign({
            userId: user._id,
            phoneNumber: user.phoneNumber,
            iat: now
        }, process.env.JWT_SECRET)

        try {
            // delete otp doc
            await otpDocRaw.delete()
            
            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                phoneNumber: newPhoneNumber.phoneNumber,
                countryCode: newPhoneNumber.countryCode,
                authToken
            })
        }
        catch {
            // send response anyway
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                phoneNumber: newPhoneNumber.phoneNumber,
                countryCode: newPhoneNumber.countryCode,
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
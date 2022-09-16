const User = require("../../db-models/User")
const phone = require("phone")

module.exports = async (req, res, next) => {

    try {
        const phoneNumber = req.phoneNumber
        if (!phoneNumber){
            return next({
                status: 403,
                data: {
                    message: "Access Denied"
                }
            })
        }

        // validate new phone number
        const newPhoneNumber = phone(req.body.phoneNumber || "", {country: "IN"})
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
                    message: `Phone number has already been registered`
                }
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
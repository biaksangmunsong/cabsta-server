const { phone } = require("phone")
const jwt = require("jsonwebtoken")
const User = require("../../db-models/User")

module.exports = async (req, res, next) => {

    try {
        const phoneNumber = req.phoneNumber
        const name = String(req.body.name || "")

        // check if name is valid
        if (!name){
            return next({
                status: 406,
                data: {
                    message: "Name is required"
                }
            })
        }
        else if (name.length < 4){
            return next({
                status: 406,
                data: {
                    message: "Name too short"
                }
            })
        }
        else if (name.length > 50){
            return next({
                status: 406,
                data: {
                    message: "Name too long"
                }
            })
        }

        // set name on database
        await User.findOneAndUpdate({phoneNumber}, {name})

        // send response
        res
        .status(200)
        .setHeader("Cache-Control", "no-store")
        .json({name})
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
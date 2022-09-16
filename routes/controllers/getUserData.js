const User = require("../../db-models/User")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId

        // get user data from database
        const user = await User.findOne({_id: userId})
        if (!user){
            return next({
                status: 404,
                data: {
                    message: "User not found"
                }
            })
        }

        // send response
        res
        .status(200)
        .setHeader("Cache-Control", "no-store")
        .json({
            _id: user._id,
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            name: user.name,
            profilePhoto: user.profilePhoto
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
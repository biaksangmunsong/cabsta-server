const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {

    try {
        // generate jwt
        const authToken = jwt.sign({
            driverId: "6353b3bbc839bbb30e5b1c99",
            phoneNumber: "+917085259566",
            iat: Date.now()
        }, process.env.DRIVER_JWT_SECRET)

        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({authToken})
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
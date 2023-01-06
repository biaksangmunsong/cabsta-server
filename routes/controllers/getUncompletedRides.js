const getUncompletedRides = require("../../lib/getUncompletedRides")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId

        // get upto 5 uncompleted rides
        const uncompletedRides = await getUncompletedRides(userId, 5)

        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(uncompletedRides)
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
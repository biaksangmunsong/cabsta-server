module.exports = async (req, res, next) => {
    
    try {
        const rideDetails = req.rideDetails
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            ...rideDetails,
            note: "Distance and Estimated Time may not always be accurate due to traffic jams or other complications."
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
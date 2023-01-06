const calculateEarnings = require("../../../lib/calculateEarnings")

module.exports = async (req, res, next) => {
    
    try {
        const driverId = req.driverId
        let earningsFor = req.query.for
        
        if (earningsFor !== "this_week" || earningsFor !== "this_month" || earningsFor !== "this_year" || earningsFor !== "all_time"){
            earningsFor = "today"
        }

        const responseData = await calculateEarnings(driverId, earningsFor)
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(responseData)
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
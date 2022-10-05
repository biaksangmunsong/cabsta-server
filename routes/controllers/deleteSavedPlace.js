const ObjectId = require('mongoose').Types.ObjectId
const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const placeId = String(req.body.placeId || "")
        
        // validate input
        if (!placeId){
            return next({
                status: 406,
                data: {
                    message: "Please specify a place to delete"
                }
            })
        }
        if (!ObjectId.isValid(placeId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid Request"
                }
            })
        }
        
        // find and delete place form database
        await SavedPlace.findOneAndDelete({
            _id: placeId,
            user: userId
        })
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({_id: placeId})
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
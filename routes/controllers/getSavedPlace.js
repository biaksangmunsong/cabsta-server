const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const placeId = String(req.query.placeId || "")
        
        if (!placeId){
            return next({
                status: 406,
                data: {
                    message: "Please specify a place to get"
                }
            })
        }

        // get place from database
        const place = await SavedPlace.findOne({
            _id: placeId,
            user: userId
        })

        if (!place){
            return next({
                status: 404,
                data: {
                    message: "Place not found"
                }
            })
        }
        
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            _id: place._id,
            user: place.user,
            title: place.title,
            address: place.address,
            coords: {
                lat: place.location.coordinates[1],
                lng: place.location.coordinates[0]
            },
            lastModified: place.lastModified,
            createdAt: place.createdAt
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
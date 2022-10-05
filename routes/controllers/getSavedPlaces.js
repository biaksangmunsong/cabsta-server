const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {
    
    try {
        const userId = req.userId
        const lastPlace = Number(req.query.lastPlace) || Date.now()
        
        // get places from database
        const places = await SavedPlace.find({
            user: userId,
            lastModified: {
                $lt: lastPlace
            }
        }).sort({lastModified: -1}).limit(50)
        
        // build response data
        const responseData = []
        for (let i = 0; i < places.length; i++){
            const place = places[i].toJSON()
            responseData.push({
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
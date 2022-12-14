const mongoose = require("mongoose")
const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const placeId = String(req.body.placeId || "")
        const title = String(req.body.title || "")
        const address = String(req.body.address || "")
        const coords = req.body.coords
        
        // validate input
        if (!placeId){
            return next({
                status: 406,
                data: {
                    message: "Please specify a place to edit"
                }
            })
        }
        if (!mongoose.Types.ObjectId.isValid(placeId)){
            return next({
                status: 406,
                data: {
                    message: "Invalid Request"
                }
            })
        }
        if (!title){
            return next({
                status: 406,
                data: {
                    message: "Title is required"
                }
            })
        }
        if (title.length > 100){
            return next({
                status: 406,
                data: {
                    message: "Title too long"
                }
            })
        }
        if (!address){
            return next({
                status: 406,
                data: {
                    message: "Formatted address is required"
                }
            })
        }
        if (address.length > 500){
            return next({
                status: 406,
                data: {
                    message: "Formatted address too long"
                }
            })
        }
        if (typeof(coords) !== "object"){
            return next({
                status: 406,
                data: {
                    message: "Invalid place coordinates"
                }
            })
        }
        if (typeof(coords.lat) !== "number" || typeof(coords.lng) !== "number"){
            return next({
                status: 406,
                data: {
                    message: "Invalid place coordinates"
                }
            })
        }

        // check if place document with placeId exist in database
        let place = await SavedPlace.findOne({
            _id: placeId,
            user: userId
        })
        if (!place){
            return next({
                status: 404,
                data: {
                    message: "Saved place not found in database"
                }
            })
        }

        // update
        place.title = title
        place.address = address
        place.location = {
            type: "Point",
            coordinates: [coords.lng,coords.lat]
        }
        place.lastModified = Date.now()
        
        await place.save()

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
                lat: place.toJSON().location.coordinates[1],
                lng: place.toJSON().location.coordinates[0]
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
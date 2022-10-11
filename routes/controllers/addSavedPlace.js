const mongoose = require("mongoose")
const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {
    
    try {
        const userId = req.userId
        const title = String(req.body.title || "")
        const address = String(req.body.address || "")
        const coords = req.body.coords

        // validate input
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

        // add place to database
        const now = Date.now()
        const newPlace = new SavedPlace({
            _id: new mongoose.Types.ObjectId().toHexString(),
            user: userId,
            title,
            address,
            location: {
                type: "Point",
                coordinates: [coords.lng,coords.lat]
            },
            lastModified: now,
            createdAt: now
        })

        await newPlace.save()

        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
            _id: newPlace._id,
            user: newPlace.user,
            title: newPlace.title,
            address: newPlace.address,
            coords: {
                lat: newPlace.toJSON().location.coordinates[1],
                lng: newPlace.toJSON().location.coordinates[0]
            },
            lastModified: newPlace.lastModified,
            createdAt: newPlace.createdAt
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
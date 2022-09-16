const mongoose = require("mongoose")
const SavedPlace = require("../../db-models/SavedPlace")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        const title = String(req.body.title || "")
        const formattedAddress = String(req.body.formattedAddress || "")
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
        if (title.length > 200){
            return next({
                status: 406,
                data: {
                    message: "Title too long"
                }
            })
        }
        if (!formattedAddress){
            return next({
                status: 406,
                data: {
                    message: "Formatted address is required"
                }
            })
        }
        if (formattedAddress.length > 500){
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
        const newPlace = new SavedPlace({
            _id: new mongoose.Types.ObjectId().toHexString(),
            user: userId,
            title,
            formattedAddress,
            coords
        })

        await newPlace.save()

        // send response
        res
        .status(200)
        .setHeader("Cache-Control", "no-store")
        .json({
            _id: newPlace._id,
            user: newPlace.user,
            title: newPlace.title,
            formattedAddress: newPlace.formattedAddress,
            coords: newPlace.coords
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
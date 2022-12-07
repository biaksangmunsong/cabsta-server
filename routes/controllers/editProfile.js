const User = require("../../db-models/User")
const cloudinary = require("cloudinary").v2
const validateName = require("../../lib/validateName")

module.exports = async (req, res, next) => {

    try {
        const userId = req.userId
        let profilePhoto = String(req.body.profilePhoto || "")
        const name = String(req.body.name || "")

        // check if profile photo is valid
        if (profilePhoto && !profilePhoto.startsWith("https://") && profilePhoto !== "delete"){
            if (!profilePhoto.startsWith("data:image/")){
                return next({
                    status: 406,
                    data: {
                        code: "profile-photo-error",
                        message: "Profile photo is invalid"
                    }
                })
            }
            // check profile photo file size
            const fileSize = ((profilePhoto.length * (3/4))-(profilePhoto.endsWith("==") ? 2 : profilePhoto.endsWith("=") ? 1 : 0))/1000
            if (fileSize < 1){
                // file too small (less than 1kb)
                return next({
                    status: 406,
                    data: {
                        code: "profile-photo-error",
                        message: "Profile photo too small"
                    }
                })
            }
            if (fileSize > 1000){
                // file too large (larger than 1000kb)
                return next({
                    status: 406,
                    data: {
                        code: "profile-photo-error",
                        message: "Profile photo too big"
                    }
                })
            }
        }
        else {
            if (profilePhoto !== "delete"){
                profilePhoto = ""
            }
        }
        
        // check if name is valid
        const nameCheck = validateName(name)
        if (nameCheck.error){
            return next({
                status: 406,
                data: {
                    message: nameCheck.error.message
                }
            })
        }
        
        // get user data from database
        const user = await User.findOne({_id: userId})
        if (!user){
            return next({
                status: 404,
                data: {
                    message: "User not found"
                }
            })
        }

        // update profile photo
        if (profilePhoto && profilePhoto !== "delete"){
            // upload profile photo
            const uploadedFile = await cloudinary.uploader.upload(profilePhoto, {
                public_id: `profile-photos/${user._id}`,
                eager: [
                    {
                        width: 1000,
                        height: 1000,
                        crop: "fill",
                        gravity: "face",
                        format: "jpg"
                    },
                    {
                        width: 200,
                        height: 200,
                        crop: "fill",
                        gravity: "face",
                        format: "jpg"
                    }
                ]
            })

            // update user's data on database
            user.profilePhoto = {
                public_id: uploadedFile.public_id,
                url: uploadedFile.eager[0].secure_url,
                thumbnail_url: uploadedFile.eager[1].secure_url
            }
            user.name = name

            await user.save()

            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                name,
                profilePhoto: user.profilePhoto
            })
        }
        else if (profilePhoto === "delete"){
            await cloudinary.uploader.destroy(`profile-photos/${userId}`)
            user.name = name
            user.profilePhoto = undefined

            await user.save()

            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                name,
                profilePhoto: user.profilePhoto
            })
        }
        else {
            // update user's data on database
            user.name = name
            
            await user.save()

            // send response
            res
            .status(200)
            .set("Cache-Control", "no-store")
            .json({
                name,
                profilePhoto: user.profilePhoto
            })
        }
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
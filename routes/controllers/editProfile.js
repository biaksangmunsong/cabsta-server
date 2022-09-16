const User = require("../../db-models/User")
const cloudinary = require("cloudinary").v2

module.exports = async (req, res, next) => {

    try {
        const phoneNumber = req.phoneNumber
        let profilePhoto = String(req.body.profilePhoto || "")
        const name = String(req.body.name || "")

        // check if profile photo is valid
        if (profilePhoto && !profilePhoto.startsWith("https://")){
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
            profilePhoto = ""
        }
        
        // check if name is valid
        if (!name){
            return next({
                status: 406,
                data: {
                    message: "Name is required"
                }
            })
        }
        else if (name.length < 4){
            return next({
                status: 406,
                data: {
                    message: "Name too short"
                }
            })
        }
        else if (name.length > 50){
            return next({
                status: 406,
                data: {
                    message: "Name too long"
                }
            })
        }

        // get user data from database
        const user = await User.findOne({phoneNumber})
        if (!user){
            return next({
                status: 404,
                data: {
                    message: "User not found"
                }
            })
        }

        // update profile photo
        if (profilePhoto){
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
            .setHeader("Cache-Control", "no-store")
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
            .setHeader("Cache-Control", "no-store")
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
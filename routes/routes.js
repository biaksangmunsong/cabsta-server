const express = require("express")
const router = express.Router()

const verifyUser = require("../middlewares/verifyUser")
const verifyDriver = require("../middlewares/verifyDriver")
const withRideDetails = require("../middlewares/withRideDetails")

const sendSigninOtp = require("./controllers/sendSigninOtp")
const signin = require("./controllers/signin")
const getUserData = require("./controllers/getUserData")
const editProfile = require("./controllers/editProfile")
const addSavedPlace = require("./controllers/addSavedPlace")
const editSavedPlace = require("./controllers/editSavedPlace")
const deleteSavedPlace = require("./controllers/deleteSavedPlace")
const getSavedPlace = require("./controllers/getSavedPlace")
const getSavedPlaces = require("./controllers/getSavedPlaces")
const sendPhoneNumberChangeOtp = require("./controllers/sendPhoneNumberChangeOtp")
const changePhoneNumber = require("./controllers/changePhoneNumber")
const getVehicleSelectorPageData = require("./controllers/getVehicleSelectorPageData")
const getPricingData = require("./controllers/getPricingData")
const getActiveDrivers = require("./controllers/getActiveDrivers")
const requestARide = require("./controllers/requestARide")

const driverSignin = require("./controllers/driver/signin")
const getOnline = require("./controllers/driver/getOnline")
const getOffline = require("./controllers/driver/getOffline")
const checkOnline = require("./controllers/driver/checkOnline")
const setFcmToken = require("./controllers/driver/setFcmToken")
const getRideRequestDetails = require("./controllers/driver/getRideRequestDetails")

// const SavedPlace = require("../db-models/SavedPlace")
const Driver = require("../db-models/Driver")
const { getMessaging } = require("firebase-admin/messaging")

router.get("/", async (req, res, next) => {
    res.send("Hello from Cabsta Api")
})


router.get("/add-driver", async (req, res, next) => {
    try {
        const newDriver = new Driver({
            phoneNumber: "+917085259525",
            countryCode: "+91",
            name: "Driver Twenty Four",
            vehicle: {
                model: "Mahindra Thar",
                numberPlate: "MN060099"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 1037385000000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverOne = new Driver({
            phoneNumber: "+917085259524",
            countryCode: "+91",
            name: "Driver Twenty Three",
            vehicle: {
                model: "Bolero",
                numberPlate: "MN066834"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 1005849000000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverTwo = new Driver({
            phoneNumber: "+917085259523",
            countryCode: "+91",
            name: "Driver Twenty Two",
            vehicle: {
                model: "Scorpio",
                numberPlate: "MN030968"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 1005849000000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverThree = new Driver({
            phoneNumber: "+917085259522",
            countryCode: "+91",
            name: "Driver Twenty One",
            vehicle: {
                model: "Bolero",
                numberPlate: "MN033256"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 721852200000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverFour = new Driver({
            phoneNumber: "+917085259521",
            countryCode: "+91",
            name: "Driver Twenty",
            vehicle: {
                model: "Celero",
                numberPlate: "MN032345"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 658693800000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverFive = new Driver({
            phoneNumber: "+917085259520",
            countryCode: "+91",
            name: "Driver Nineteen",
            vehicle: {
                model: "Maruti suzuki swift",
                numberPlate: "MN036380"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 627157800000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        const newDriverSix = new Driver({
            phoneNumber: "+917085259519",
            countryCode: "+91",
            name: "Driver Eighteen",
            vehicle: {
                model: "Mahindra Thar",
                numberPlate: "MN068950"
            },
            vehicleType: "four-wheeler",
            gender: "male",
            dob: 1068921000000,
            photo: {
                url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg",
                thumbnail_url: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1610410038/pexels-sebastiaan-stam-1097456_l3w7in.jpg"
            }
        })
        await newDriver.save()
        await newDriverOne.save()
        await newDriverTwo.save()
        await newDriverThree.save()
        await newDriverFour.save()
        await newDriverFive.save()
        await newDriverSix.save()
        res.send("done")

        // generate jwt
        // const authToken = jwt.sign({
        //     userId: ,
        //     phoneNumber: "+917085259566",
        //     iat: now
        // }, process.env.JWT_SECRET)

        // // send response
        // res
        // .status(200)
        // .set("Cache-Control", "no-store")
        // .json({authToken})
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/update-active-driver", async (req, res, next) => {
    try {
        await ActiveDriver.updateOne({_id: req.query._id}, {
            lastUpdated: new Date
        })
        
        res.send("done")
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/test", async (req, res, next) => {
    
    try {
        // let start = Date.now()
        // const drivers = await Driver.find({
        //     _id: {
        //         $in: [
        //             "6353b3bbc839bbb30e5b1c99",
        //             // "6353b3bbc839bbb30e5b1c00",
        //             "6374adf8f89757bbe43cbae6"
        //         ]
        //     }
        // })
        // console.log(Date.now()-start)

        const latlng = "24.336743, 93.685346"
        await req.redisClient.sendCommand([
            "GEOADD",
            "active_four_wheeler_drivers",
            String(latlng.split(", ")[1]),
            String(latlng.split(", ")[0]),
            "6374b75054a57dcd5fdb25b4"
        ])

        res
        .status(200)
        .send("DONE")
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }



    // try {
    //     const places = await SavedPlace.find({
    //         location: {
    //             $near: {
    //                 $geometry: {
    //                     type: "Point",
    //                     coordinates: [
    //                         93.670855, // longitude
    //                         24.333492 // latitude
    //                     ]
    //                 },
    //                 $minDistance: 10,
    //                 $maxDistance: 3000
    //             }
    //         }
    //     }).limit(2)
    //     res.json(places)
    // }
    // catch (err){
    //     console.log(err)
    //     next({
    //         data: {
    //             message: "Internal server error"
    //         }
    //     })
    // }
})
router.get("/send-test-notification", async (req, res, next) => {
    try {
        const fcmMessage = {
            token: "c58I7zzXTy2977dntLxOqW:APA91bE1AlhVvHr1x2-PeGsAHA0vWbET01cVVfsI0tN0XZbjQnia3TL0XPJoF3yO_axeufMfTiz6oOEWOEUxc0F0ADrsg8WLOAQbDZjmoufbo8GA7epJVrlmOZaNiSts8_Kt7cZpfcgB",
            notification: {
                title: "Ride Request",
                body: "You've got a ride request, please renpond within 30 seconds."
            },
            data: {
                id: "1234"
            },
            android: {
                ttl: 0,
                priority: "high",
                notification: {
                    sound: "default",
                    channel_id: "ride-request",
                    tag: "ride-request"
                }
            }
        }
        await getMessaging().send(fcmMessage)

        res.send("done")
    }
    catch (err){
        console.log(err)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})
router.get("/test-redis", async (req, res, next) => {
    try {
        redisClient = req.redisClient


        const list = await redisClient.sendCommand([
            "KEYS",
            "*otps:signn:+70*"
        ])
        console.log(list.length)



        // await redisClient.geoAdd("active_drivers", {
        //     longitude: 93.6967933,
        //     latitude: 24.339645,
        //     member: "driver1"
        // })


        const results = await redisClient.sendCommand([
            "GEOSEARCH",
            "active_drivers_location",
            "FROMLONLAT",
            "93.690117",
            "24.313994",
            "BYRADIUS",
            "20",
            "km",
            "WITHDIST",
            "ASC",
            "COUNT",
            "10"
        ])
        console.log(results)
        return res.json(results)


        // await redisClient.sendCommand([
        //     "GEOADD",
        //     "active_drivers",
        //     "93.699744",
        //     "24.345665",
        //     "driver3"
        // ])

        // const setDriver = async id => {
        //     await redisClient.sendCommand([
        //         "SETEX",
        //         `active_drivers:data:${id}`,
        //         "10",
        //         JSON.stringify({
        //             name: "Name",
        //             age: 22,
        //             gender: "male",
        //             vehicleType: "two-wheeler"
        //         })
        //     ])

        //     return id
        // }

        const setLocation = async id => {
            await redisClient.geoAdd("active_drivers_location", {
                longitude: 93.6967933,
                latitude: 24.339645,
                member: id
            })

            return id
        }

        const ids = ["driver1", "driver2", "driver3", "driver4", "driver5", "driver6", "driver7", "driver8", "driver9", "driver10", "driver11", "driver12", "driver13", "driver14", "driver15"]
        await Promise.all(ids.map(id => setLocation(id)))

        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver1",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver2",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver3",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        // await redisClient.sendCommand([
        //     "SETEX",
        //     "active_drivers:data:driver4",
        //     "10",
        //     JSON.stringify({
        //         name: "Name",
        //         age: 22,
        //         gender: "male",
        //         vehicleType: "two-wheeler"
        //     })
        // ])
        




        res.send("ok")
        // const value = await redisClient.get("hello")
        // res.send(value || "null")
    }
    catch (err){
        console.log(err.message)
        next({
            data: {
                message: "Internal server error"
            }
        })
    }
})


router.post("/send-signin-otp", sendSigninOtp)
router.post("/signin", signin)
router.get("/get-pricing-data", getPricingData)
router.get("/get-user-data", verifyUser, getUserData)
router.post("/edit-profile", verifyUser, editProfile)
router.post("/add-saved-place", verifyUser, addSavedPlace)
router.post("/edit-saved-place", verifyUser, editSavedPlace)
router.delete("/delete-saved-place", verifyUser, deleteSavedPlace)
router.get("/get-saved-place", verifyUser, getSavedPlace)
router.get("/get-saved-places", verifyUser, getSavedPlaces)
router.post("/send-phone-number-change-otp", verifyUser, sendPhoneNumberChangeOtp)
router.post("/change-phone-number", verifyUser, changePhoneNumber)
router.post("/change-phone-number", verifyUser, changePhoneNumber)
router.get("/get-vehicle-selector-page-data", verifyUser, withRideDetails, getVehicleSelectorPageData)
router.get("/get-active-drivers", verifyUser, withRideDetails, getActiveDrivers)
router.post("/request-a-ride", verifyUser, withRideDetails, requestARide)

router.post("/driver/signin", driverSignin)
router.post("/driver/get-online", verifyDriver, getOnline)
router.delete("/driver/get-offline", verifyDriver, getOffline)
router.get("/driver/check-online", verifyDriver, checkOnline)
router.post("/driver/set-fcm-token", verifyDriver, setFcmToken)
router.get("/driver/get-ride-request-details", verifyDriver, getRideRequestDetails)

module.exports = router